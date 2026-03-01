#!/usr/bin/env bash
#
# Prolato VPS Setup Script
# Provisions a fresh Ubuntu/Debian VPS with all Prolato components.
# Idempotent — safe to re-run. Must be run as root.
#
# Usage: sudo bash setup.sh

set -euo pipefail

# -- Color helpers ----------------------------------------------------------
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERR]${NC}  $*"; }
section() { echo -e "\n${BOLD}${CYAN}==> $*${NC}\n"; }

[[ $EUID -ne 0 ]] && { error "This script must be run as root."; exit 1; }

# -- Interactive prompts ----------------------------------------------------
prompt_config() {
    section "Configuration"
    read -rp "Enter your domain (e.g. example.dev): " DOMAIN
    [[ -z "$DOMAIN" ]] && { error "Domain cannot be empty."; exit 1; }
    read -rsp "Enter your Cloudflare API token: " CF_API_TOKEN
    echo ""
    [[ -z "$CF_API_TOKEN" ]] && { error "Cloudflare API token cannot be empty."; exit 1; }
    read -rp "Enter email for TLS certificates [admin@${DOMAIN}]: " TLS_EMAIL
    [[ -z "$TLS_EMAIL" ]] && TLS_EMAIL="admin@${DOMAIN}"
    read -rp "Enter Prolato git repo URL [leave blank for placeholder]: " WEBHOOK_REPO_URL
    [[ -z "$WEBHOOK_REPO_URL" ]] && { WEBHOOK_REPO_URL="WEBHOOK_REPO_URL"; warn "Using placeholder repo URL."; }
    echo ""
    info "Domain:           ${DOMAIN}"
    info "Cloudflare token: ${CF_API_TOKEN:0:8}..."
    info "TLS email:        ${TLS_EMAIL}"
    info "Webhook repo:     ${WEBHOOK_REPO_URL}"
    echo ""
    read -rp "Continue? [Y/n] " CONFIRM
    [[ "${CONFIRM,,}" == "n" ]] && { error "Aborted."; exit 1; }
}

# -- 1. Update OS packages -------------------------------------------------
update_os() {
    section "Updating OS packages"
    apt-get update -y && apt-get upgrade -y
    apt-get install -y curl wget gnupg2 software-properties-common \
        git jq ufw fail2ban unzip tar
    success "OS packages updated."
}

# -- 2. Create deploy user -------------------------------------------------
create_deploy_user() {
    section "Creating deploy user"
    if id "deploy" &>/dev/null; then
        success "User 'deploy' already exists."
    else
        useradd --system --create-home --shell /bin/bash deploy
        success "User 'deploy' created."
    fi
    groupadd -f docker
    usermod -aG docker deploy 2>/dev/null || true
    success "User 'deploy' added to docker group."
}

# -- 3. Install Docker -----------------------------------------------------
install_docker() {
    section "Installing Docker"
    if command -v docker &>/dev/null; then
        success "Docker already installed: $(docker --version)"
    else
        curl -fsSL https://get.docker.com | bash
        systemctl enable docker && systemctl start docker
        success "Docker installed: $(docker --version)"
    fi
    usermod -aG docker deploy 2>/dev/null || true
}

# -- 4. Install Node.js 20 LTS ---------------------------------------------
install_nodejs() {
    section "Installing Node.js 20 LTS"
    if command -v node &>/dev/null && [[ "$(node --version)" == v20.* ]]; then
        success "Node.js 20 already installed: $(node --version)"
        return
    fi
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    success "Node.js installed: $(node --version)"
}

# -- 5. Build Caddy with Cloudflare DNS plugin ------------------------------
install_caddy() {
    section "Installing Caddy with Cloudflare DNS plugin"
    if command -v caddy &>/dev/null && caddy list-modules 2>/dev/null | grep -q "dns.providers.cloudflare"; then
        success "Caddy with Cloudflare plugin already installed: $(caddy version)"
        return
    fi
    # Install Go if missing
    if ! command -v go &>/dev/null; then
        info "Installing Go..."
        local GO_ARCH
        case "$(dpkg --print-architecture)" in
            amd64)  GO_ARCH="amd64" ;;
            arm64)  GO_ARCH="arm64" ;;
            armhf)  GO_ARCH="armv6l" ;;
            *)      error "Unsupported architecture: $(dpkg --print-architecture)"; exit 1 ;;
        esac
        wget -q "https://go.dev/dl/go1.22.5.linux-${GO_ARCH}.tar.gz" -O /tmp/go.tar.gz
        rm -rf /usr/local/go && tar -C /usr/local -xzf /tmp/go.tar.gz && rm /tmp/go.tar.gz
        export PATH="/usr/local/go/bin:$PATH"
    fi
    export PATH="/usr/local/go/bin:$HOME/go/bin:$PATH"
    info "Installing xcaddy and building Caddy..."
    go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest
    xcaddy build --with github.com/caddy-dns/cloudflare --output /usr/bin/caddy
    groupadd --system caddy 2>/dev/null || true
    useradd --system --gid caddy --create-home --home-dir /var/lib/caddy \
        --shell /usr/sbin/nologin caddy 2>/dev/null || true
    cat > /etc/systemd/system/caddy.service <<'UNIT'
[Unit]
Description=Caddy
After=network.target network-online.target
Requires=network-online.target
[Service]
Type=notify
User=caddy
Group=caddy
EnvironmentFile=/etc/caddy/caddy.env
ExecStart=/usr/bin/caddy run --environ --config /etc/caddy/Caddyfile
ExecReload=/usr/bin/caddy reload --config /etc/caddy/Caddyfile
TimeoutStopSec=5s
LimitNOFILE=1048576
PrivateTmp=true
ProtectSystem=full
AmbientCapabilities=CAP_NET_BIND_SERVICE
[Install]
WantedBy=multi-user.target
UNIT
    systemctl daemon-reload
    success "Caddy built and installed: $(caddy version)"
}

# -- 6. Generate Caddyfile -------------------------------------------------
generate_caddyfile() {
    section "Generating Caddyfile"
    mkdir -p /etc/caddy/projects.d
    if [[ -f /etc/caddy/Caddyfile ]]; then
        warn "Caddyfile already exists at /etc/caddy/Caddyfile, not overwriting."
    else
        cat > /etc/caddy/Caddyfile <<EOF
{
    email ${TLS_EMAIL}
}

${DOMAIN} {
    root * /var/www/webapp
    file_server
}

git.${DOMAIN} {
    reverse_proxy localhost:3000
}

webhook.${DOMAIN} {
    reverse_proxy localhost:9000
}

*.${DOMAIN} {
    tls {
        dns cloudflare {env.CF_API_TOKEN}
    }
    import /etc/caddy/projects.d/*
    root * /var/www/projects/{labels.2}
    try_files {path} /index.html
    file_server
}
EOF
        success "Caddyfile generated at /etc/caddy/Caddyfile"
    fi
    # Store CF token in env file instead of plaintext in Caddyfile
    if [[ ! -f /etc/caddy/caddy.env ]]; then
        echo "CF_API_TOKEN=${CF_API_TOKEN}" > /etc/caddy/caddy.env
        chmod 640 /etc/caddy/caddy.env
        chown root:caddy /etc/caddy/caddy.env
        success "Caddy env file created at /etc/caddy/caddy.env"
    else
        warn "Caddy env file already exists, not overwriting."
    fi
    chown -R caddy:caddy /etc/caddy
    # Preserve env file ownership after recursive chown
    chown root:caddy /etc/caddy/caddy.env 2>/dev/null || true
}

# -- 7. Install and configure Gitea ----------------------------------------
install_gitea() {
    section "Installing Gitea"
    local VER="1.22.6" BIN="/usr/local/bin/gitea"
    if [[ -f "$BIN" ]] && "$BIN" --version 2>/dev/null | grep -q "$VER"; then
        success "Gitea ${VER} already installed."
    else
        info "Downloading Gitea ${VER}..."
        wget -q "https://dl.gitea.com/gitea/${VER}/gitea-${VER}-linux-amd64" -O "$BIN"
        chmod +x "$BIN"
        success "Gitea ${VER} installed."
    fi
    id "git" &>/dev/null || adduser --system --shell /bin/bash \
        --gecos 'Git Version Control' --group --disabled-password --home /home/git git
    mkdir -p /var/lib/gitea/{custom,data,log} /etc/gitea
    chown -R git:git /var/lib/gitea
    chown -R root:git /etc/gitea && chmod 770 /etc/gitea
    if [[ -f /etc/gitea/app.ini ]]; then
        warn "Gitea app.ini already exists, not overwriting."
    else
        cat > /etc/gitea/app.ini <<EOF
APP_NAME = Prolato Git
RUN_MODE = prod
RUN_USER = git

[database]
DB_TYPE  = sqlite3
PATH     = /var/lib/gitea/data/gitea.db

[repository]
ROOT = /home/git/gitea-repositories

[server]
DOMAIN           = git.${DOMAIN}
SSH_DOMAIN       = git.${DOMAIN}
ROOT_URL         = https://git.${DOMAIN}/
HTTP_PORT        = 3000
START_SSH_SERVER = true
SSH_PORT         = 2222
LFS_START_SERVER = true
OFFLINE_MODE     = false

[service]
DISABLE_REGISTRATION       = false
REQUIRE_SIGNIN_VIEW        = false
REGISTER_EMAIL_CONFIRM     = false
ENABLE_NOTIFY_MAIL         = false

[mailer]
ENABLED = false

[session]
PROVIDER = file

[log]
MODE      = console
LEVEL     = info
ROOT_PATH = /var/lib/gitea/log

[security]
INSTALL_LOCK = true
EOF
        chown root:git /etc/gitea/app.ini && chmod 640 /etc/gitea/app.ini
        success "Gitea app.ini generated."
    fi
    if [[ -f /etc/systemd/system/gitea.service ]]; then
        warn "Gitea systemd unit already exists, not overwriting."
    else
    cat > /etc/systemd/system/gitea.service <<'UNIT'
[Unit]
Description=Gitea (Git with a cup of tea)
After=network.target
[Service]
Type=simple
User=git
Group=git
WorkingDirectory=/var/lib/gitea/
ExecStart=/usr/local/bin/gitea web --config /etc/gitea/app.ini
Restart=always
RestartSec=5
Environment=USER=git HOME=/home/git GITEA_WORK_DIR=/var/lib/gitea
[Install]
WantedBy=multi-user.target
UNIT
    fi
    systemctl daemon-reload
    success "Gitea configured."
}

# -- 8. Generate SSH keypair for deploy-bot ---------------------------------
generate_ssh_key() {
    section "Generating SSH keypair for deploy-bot"
    local SSH_DIR="/home/deploy/.ssh" KEY="/home/deploy/.ssh/id_ed25519"
    mkdir -p "$SSH_DIR"
    if [[ -f "$KEY" ]]; then
        success "SSH keypair already exists at ${KEY}"
    else
        ssh-keygen -t ed25519 -C "deploy-bot@${DOMAIN}" -f "$KEY" -N ""
        success "SSH keypair generated at ${KEY}"
    fi
    cat > "${SSH_DIR}/config" <<EOF
Host git.${DOMAIN}
    HostName localhost
    Port 2222
    User git
    IdentityFile ${KEY}
    StrictHostKeyChecking no
EOF
    chown -R deploy:deploy "$SSH_DIR"
    chmod 700 "$SSH_DIR" && chmod 600 "$KEY" "${SSH_DIR}/config" && chmod 644 "${KEY}.pub"
    success "SSH config written to ${SSH_DIR}/config"
}

# -- 9. Create directories -------------------------------------------------
create_directories() {
    section "Creating project directories"
    for DIR in /var/www/webapp /var/www/projects /opt/docker-projects \
               /etc/caddy/projects.d /opt/webhook /var/log/webhook; do
        mkdir -p "$DIR"
    done
    chown -R deploy:deploy /var/www/projects /opt/docker-projects /opt/webhook /var/log/webhook
    chown -R caddy:caddy /etc/caddy/projects.d
    success "All directories created."
}

# -- 10. Configure sudoers for deploy user ----------------------------------
configure_sudoers() {
    section "Configuring sudoers for deploy user"
    local TMP_SUDOERS
    TMP_SUDOERS=$(mktemp)
    cat > "$TMP_SUDOERS" <<'EOF'
# Prolato: allow deploy user to reload Caddy and restart webhook
deploy ALL=(ALL) NOPASSWD: /usr/bin/caddy reload --config /etc/caddy/Caddyfile
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart webhook
EOF
    chmod 440 "$TMP_SUDOERS"
    if visudo -cf "$TMP_SUDOERS" &>/dev/null; then
        mv "$TMP_SUDOERS" /etc/sudoers.d/deploy
        success "Sudoers configured at /etc/sudoers.d/deploy"
    else
        error "Sudoers syntax error! Discarding invalid file."
        rm -f "$TMP_SUDOERS"
        exit 1
    fi
}

# -- 11. Clone and configure webhook ---------------------------------------
setup_webhook() {
    section "Setting up webhook server"
    if [[ "$WEBHOOK_REPO_URL" == "WEBHOOK_REPO_URL" ]]; then
        warn "Webhook repo URL is a placeholder. Skipping clone."
        warn "Manually clone the repo to /opt/webhook later."
    elif [[ -f /opt/webhook/package.json ]]; then
        success "Webhook already present at /opt/webhook"
        (cd /opt/webhook && git pull) || warn "Git pull failed. Continuing..."
    else
        info "Cloning webhook from ${WEBHOOK_REPO_URL}..."
        local TMP; TMP=$(mktemp -d)
        git clone "$WEBHOOK_REPO_URL" "$TMP"
        cp -r "$TMP/webhook/"* /opt/webhook/ 2>/dev/null || cp -r "$TMP/"* /opt/webhook/ 2>/dev/null || true
        rm -rf "$TMP"
    fi
    [[ -f /opt/webhook/package.json ]] && { info "Running npm install..."; (cd /opt/webhook && npm install --production); success "npm dependencies installed."; }
    # Generate .env with deploy token
    local ENV_FILE="/opt/webhook/.env"
    if [[ -f "$ENV_FILE" ]]; then
        success "Webhook .env already exists."
        DEPLOY_TOKEN=$(grep "^DEPLOY_TOKEN=" "$ENV_FILE" | cut -d= -f2)
    else
        DEPLOY_TOKEN=$(openssl rand -hex 32)
        cat > "$ENV_FILE" <<EOF
DEPLOY_TOKEN=${DEPLOY_TOKEN}
DOMAIN=${DOMAIN}
GITEA_URL=https://git.${DOMAIN}
GITEA_ADMIN_TOKEN=your-gitea-admin-token
REGISTRY_PATH=/opt/webhook/registry.json
PROJECTS_DIR=/var/www/projects
DOCKER_PROJECTS_DIR=/opt/docker-projects
CADDY_PROJECTS_DIR=/etc/caddy/projects.d
DEPLOY_LOG_PATH=/opt/webhook/deploy-log.jsonl
PORT=9000
EOF
        success "Webhook .env generated with deploy token."
    fi
    [[ ! -f /opt/webhook/registry.json ]] && echo '{"projects":{},"next_port":3001,"users":{}}' | jq . > /opt/webhook/registry.json
    chown -R deploy:deploy /opt/webhook
    success "Webhook setup complete."
}

# -- 12. Create webhook systemd unit ---------------------------------------
create_webhook_service() {
    section "Creating webhook systemd unit"
    if [[ -f /etc/systemd/system/webhook.service ]]; then
        warn "Webhook systemd unit already exists, not overwriting."
    else
        cat > /etc/systemd/system/webhook.service <<'UNIT'
[Unit]
Description=Prolato Deploy Webhook
After=network.target docker.service
[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=/opt/webhook
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=5
EnvironmentFile=/opt/webhook/.env
StandardOutput=append:/var/log/webhook/webhook.log
StandardError=append:/var/log/webhook/webhook.log
[Install]
WantedBy=multi-user.target
UNIT
        success "Webhook systemd unit created."
    fi
    systemctl daemon-reload
}

# -- 13. Create logrotate config -------------------------------------------
create_logrotate() {
    section "Creating logrotate config for webhook"
    cat > /etc/logrotate.d/webhook <<'LOGROTATE'
/var/log/webhook/webhook.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
LOGROTATE
    success "Logrotate config created at /etc/logrotate.d/webhook"
}

# -- 14. Enable and start services -----------------------------------------
enable_services() {
    section "Enabling and starting services"
    for SVC in caddy gitea webhook; do
        systemctl enable "$SVC"
        systemctl restart "$SVC" || warn "${SVC} failed to start. Check: journalctl -u ${SVC}"
    done
    for SVC in caddy gitea webhook; do
        systemctl is-active --quiet "$SVC" && success "${SVC} is running." || warn "${SVC} is NOT running."
    done
}

# -- 15. Print summary and next steps --------------------------------------
print_summary() {
    section "Setup Complete!"
    echo -e "${BOLD}Generated Credentials:${NC}"
    echo -e "  Deploy Token:    ${GREEN}${DEPLOY_TOKEN}${NC}"
    echo -e "  SSH Public Key:  ${CYAN}/home/deploy/.ssh/id_ed25519.pub${NC}"
    echo ""
    echo -e "${BOLD}Service URLs:${NC}"
    echo -e "  Webapp:   https://${DOMAIN}"
    echo -e "  Gitea:    https://git.${DOMAIN}"
    echo -e "  Webhook:  https://webhook.${DOMAIN}"
    echo ""
    echo -e "${BOLD}${YELLOW}Next Manual Steps:${NC}"
    echo "  1. Configure DNS on Cloudflare:"
    echo "     A record: ${DOMAIN}   -> VPS IP (DNS only)"
    echo "     A record: *.${DOMAIN} -> VPS IP (DNS only)"
    echo ""
    echo "  2. Open Gitea and create admin account:"
    echo "     https://git.${DOMAIN}"
    echo ""
    echo "  3. Generate Gitea admin API token:"
    echo "     Settings -> Applications -> Generate New Token"
    echo "     Update GITEA_ADMIN_TOKEN in /opt/webhook/.env"
    echo "     Then: systemctl restart webhook"
    echo ""
    echo "  4. Add deploy-bot SSH key to Gitea admin:"
    echo "     cat /home/deploy/.ssh/id_ed25519.pub"
    echo "     Settings -> SSH/GPG Keys -> Add Key"
    echo ""
    echo "  5. Share with team: deploy token + domain"
    echo "     Users will self-register on https://git.${DOMAIN}"
    echo -e "\n${GREEN}${BOLD}Prolato is ready!${NC}"
}

# -- Main -------------------------------------------------------------------
main() {
    echo -e "${BOLD}${CYAN}"
    echo "  ____            _       _        "
    echo " |  _ \\ _ __ ___ | | __ _| |_ ___  "
    echo " | |_) | '__/ _ \\| |/ _\` | __/ _ \\ "
    echo " |  __/| | | (_) | | (_| | || (_) |"
    echo " |_|   |_|  \\___/|_|\\__,_|\\__\\___/ "
    echo -e "\n  VPS Setup Script${NC}\n"
    prompt_config
    update_os
    create_deploy_user
    install_docker
    install_nodejs
    install_caddy
    generate_caddyfile
    install_gitea
    generate_ssh_key
    create_directories
    configure_sudoers
    setup_webhook
    create_webhook_service
    create_logrotate
    enable_services
    print_summary
}

main "$@"
