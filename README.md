# Prolato

Self-hosted platform for automatic web project deployment, integrated as a Claude Code skill.

## What Prolato Does

- **Automatically analyzes** your project's framework and database
- **Deploys static and Docker projects** with a single command
- **Generates instant URLs** with automatic subdomains (e.g., `my-project.yourdomain.dev`)
- **Full management**: rollback, logs, status, deletion

## Quick Start

See the [full documentation](https://prolato.dev/docs/overview) to get started.

## Repository Structure

```
prolato/
├── webhook/     # Node.js/Express server to handle deployments
├── skill/       # Claude Code skill (Markdown instruction files)
├── setup/       # VPS provisioning script
└── webapp/      # Next.js website with documentation
```

## Requirements

- VPS with Ubuntu 22.04+ (or Debian 12+)
- Domain with DNS on Cloudflare
- Claude Code installed

## How It Works

1. Set up the VPS with the setup script
2. Install the Prolato skill in Claude Code
3. In your project folder, tell Claude: *"deploy this project"*

## Documentation

Full documentation is available at [prolato.dev/docs](https://prolato.dev/docs/overview).

## License

[MIT](LICENSE)
