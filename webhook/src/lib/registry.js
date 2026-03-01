import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { dirname } from 'node:path';
import lockfile from 'proper-lockfile';

const EMPTY_REGISTRY = { projects: {}, next_port: 3001, users: {} };

export class Registry {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async read() {
    if (!existsSync(this.filePath)) {
      return structuredClone(EMPTY_REGISTRY);
    }
    const raw = readFileSync(this.filePath, 'utf-8');
    return JSON.parse(raw);
  }

  async write(data) {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const tmpPath = this.filePath + '.tmp';
    writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    renameSync(tmpPath, this.filePath);
  }

  async _withLock(fn) {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    if (!existsSync(this.filePath)) {
      await this.write(structuredClone(EMPTY_REGISTRY));
    }
    const release = await lockfile.lock(this.filePath, { retries: 3 });
    try {
      return await fn();
    } finally {
      await release();
    }
  }

  async getProject(name) {
    const data = await this.read();
    return data.projects[name] || null;
  }

  async addProject(name, projectData) {
    await this._withLock(async () => {
      const data = await this.read();
      const now = new Date().toISOString();
      data.projects[name] = {
        ...projectData,
        created_at: now,
        updated_at: now,
      };
      await this.write(data);
    });
  }

  async updateProject(name, updates) {
    await this._withLock(async () => {
      const data = await this.read();
      if (!data.projects[name]) {
        throw new Error(`Project ${name} not found`);
      }
      data.projects[name] = {
        ...data.projects[name],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      await this.write(data);
    });
  }

  async removeProject(name) {
    await this._withLock(async () => {
      const data = await this.read();
      delete data.projects[name];
      await this.write(data);
    });
  }

  async assignPort() {
    let port;
    await this._withLock(async () => {
      const data = await this.read();
      port = data.next_port;
      data.next_port = port + 1;
      await this.write(data);
    });
    return port;
  }

  async listProjects(owner = null) {
    const data = await this.read();
    if (!owner) return data.projects;
    const filtered = {};
    for (const [name, project] of Object.entries(data.projects)) {
      if (project.owner === owner) {
        filtered[name] = project;
      }
    }
    return filtered;
  }

  async addUser(username, userData) {
    await this._withLock(async () => {
      const data = await this.read();
      data.users[username] = {
        ...userData,
        created_at: new Date().toISOString(),
      };
      await this.write(data);
    });
  }
}
