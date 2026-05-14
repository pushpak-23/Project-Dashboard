import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const dataDir = path.resolve(projectRoot, "server", "data");
const dbPath = path.resolve(dataDir, "dashboard.sqlite");

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource TEXT NOT NULL,
    kind TEXT NOT NULL,
    collection TEXT,
    parent_name TEXT,
    name TEXT NOT NULL,
    url TEXT,
    description TEXT,
    icon TEXT,
    logo TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    payload TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_entries_resource ON entries(resource);
  CREATE INDEX IF NOT EXISTS idx_entries_resource_kind ON entries(resource, kind);
  CREATE INDEX IF NOT EXISTS idx_entries_parent ON entries(resource, parent_name);
  CREATE INDEX IF NOT EXISTS idx_entries_collection ON entries(resource, collection);
`);

function readJson(relativePath) {
  const filePath = path.resolve(projectRoot, relativePath);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function splitKnownFields(source, knownKeys) {
  const payload = {};

  for (const [key, value] of Object.entries(source)) {
    if (knownKeys.has(key) || value === undefined) {
      continue;
    }

    payload[key] = value;
  }

  return payload;
}

function normalizeSeedRow(row) {
  const knownKeys = new Set([
    "resource",
    "kind",
    "collection",
    "parent_name",
    "name",
    "url",
    "description",
    "icon",
    "logo",
    "sort_order",
    "payload",
  ]);

  return {
    resource: row.resource,
    kind: row.kind,
    collection: row.collection ?? null,
    parent_name: row.parent_name ?? null,
    name: row.name,
    url: row.url ?? null,
    description: row.description ?? null,
    icon: row.icon ?? null,
    logo: row.logo ?? null,
    sort_order: row.sort_order ?? 0,
    payload: JSON.stringify(splitKnownFields(row, knownKeys)),
  };
}

function buildSeedRows() {
  const rows = [];

  const applicationData = readJson("src/data/application.json");
  for (const application of applicationData.applications ?? []) {
    rows.push(
      normalizeSeedRow({
        resource: "applications",
        kind: "application",
        name: application.name,
        url: application.url,
        description: application.desc,
      })
    );
  }

  const sidebarFiles = [
    { resource: "leftsidebar", file: "src/data/leftsidebar.json" },
    { resource: "rightsidebar", file: "src/data/rightSidebar.json" },
  ];

  for (const sidebar of sidebarFiles) {
    const sidebarData = readJson(sidebar.file);

    for (const group of sidebarData.items ?? []) {
      rows.push(
        normalizeSeedRow({
          resource: sidebar.resource,
          kind: "group",
          name: group.name,
          icon: group.logo,
        })
      );

      for (const child of group.children ?? []) {
        rows.push(
          normalizeSeedRow({
            resource: sidebar.resource,
            kind: "child",
            parent_name: group.name,
            name: child.name,
            url: child.url,
            icon: child.logo,
            description: child.desc,
            configs: child.configs ?? [],
            yaml: child.yaml,
          })
        );
      }
    }
  }

  const infrastructureData = readJson("src/data/infrastructure.json");
  for (const [collection, services] of Object.entries(infrastructureData)) {
    for (const service of services ?? []) {
      rows.push(
        normalizeSeedRow({
          resource: "infrastructure",
          kind: "service",
          collection,
          name: service.name,
          url: service.url,
          icon: service.logo,
          description: service.about,
          node: service.node,
          ssh_user: service.ssh_user,
          configs: service.configs ?? [],
          logs: service.logs,
        })
      );
    }
  }

  const platformData = readJson("src/data/platform.json");
  for (const platform of platformData.platforms ?? []) {
    rows.push(
      normalizeSeedRow({
        resource: "platform",
        kind: "platform",
        name: platform.name,
        url: platform.url,
        icon: platform.icon,
        description: platform.desc,
      })
    );

    for (const cluster of platform.clusters ?? []) {
      rows.push(
        normalizeSeedRow({
          resource: "platform",
          kind: "cluster",
          parent_name: platform.name,
          name: cluster.name,
          url: cluster.url,
          icon: cluster.icon,
          details: cluster.details ?? {},
        })
      );
    }
  }

  const softwareData = readJson("src/data/software.json");
  for (const software of softwareData.softwares ?? []) {
    rows.push(
      normalizeSeedRow({
        resource: "software",
        kind: "software",
        name: software.name,
        url: software.url,
        description: software.desc,
        icon: software.icon,
        configs: software.configs ?? [],
        yaml: software.yaml,
      })
    );

    for (const child of software.children ?? []) {
      rows.push(
        normalizeSeedRow({
          resource: "software",
          kind: "service",
          parent_name: software.name,
          name: child.name,
          url: child.url,
          icon: child.icon,
        })
      );
    }
  }

  const hardwareData = readJson("src/data/hardware.json");
  for (const category of hardwareData.categories ?? []) {
    for (const device of hardwareData[category] ?? []) {
      rows.push(
        normalizeSeedRow({
          resource: "hardware",
          kind: "device",
          collection: category,
          name: device.name,
          url: device.url,
          icon: device.icon,
          mgmt_ip: device.mgmt_ip,
          internal_ip: device.internal_ip,
          ssh_user: device.ssh_user,
          x: device.x,
          y: device.y,
        })
      );
    }
  }

  return rows;
}

function buildHardwareSeedRows() {
  const hardwareRows = [];
  const hardwareData = readJson("src/data/hardware.json");

  for (const category of hardwareData.categories ?? []) {
    for (const device of hardwareData[category] ?? []) {
      hardwareRows.push(
        normalizeSeedRow({
          resource: "hardware",
          kind: "device",
          collection: category,
          name: device.name,
          url: device.url,
          icon: device.icon,
          mgmt_ip: device.mgmt_ip,
          internal_ip: device.internal_ip,
          ssh_user: device.ssh_user,
          x: device.x,
          y: device.y,
        })
      );
    }
  }

  return hardwareRows;
}

function seedDatabase() {
  const count = db.prepare("SELECT COUNT(*) AS count FROM entries").get().count;

  if (count > 0) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO entries (
      resource,
      kind,
      collection,
      parent_name,
      name,
      url,
      description,
      icon,
      logo,
      sort_order,
      payload
    ) VALUES (
      @resource,
      @kind,
      @collection,
      @parent_name,
      @name,
      @url,
      @description,
      @icon,
      @logo,
      @sort_order,
      @payload
    )
  `);

  const transaction = db.transaction((rows) => {
    for (const row of rows) {
      insert.run(row);
    }
  });

  transaction(buildSeedRows());
}

function ensureHardwareSeed() {
  const hardwareCount = db
    .prepare("SELECT COUNT(*) AS count FROM entries WHERE resource = ?")
    .get("hardware").count;

  if (hardwareCount > 0) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO entries (
      resource,
      kind,
      collection,
      parent_name,
      name,
      url,
      description,
      icon,
      logo,
      sort_order,
      payload
    ) VALUES (
      @resource,
      @kind,
      @collection,
      @parent_name,
      @name,
      @url,
      @description,
      @icon,
      @logo,
      @sort_order,
      @payload
    )
  `);

  const transaction = db.transaction((rows) => {
    for (const row of rows) {
      insert.run(row);
    }
  });

  transaction(buildHardwareSeedRows());
}

function parsePayload(row) {
  try {
    return row.payload ? JSON.parse(row.payload) : {};
  } catch {
    return {};
  }
}

function inflateRow(row) {
  return {
    id: row.id,
    resource: row.resource,
    kind: row.kind,
    collection: row.collection,
    parentName: row.parent_name,
    name: row.name,
    url: row.url,
    description: row.description,
    icon: row.icon,
    logo: row.logo,
    sortOrder: row.sort_order,
    ...parsePayload(row),
  };
}

function getRows(resource) {
  return db
    .prepare(
      `
        SELECT *
        FROM entries
        WHERE resource = ?
        ORDER BY collection, parent_name, sort_order, id
      `
    )
    .all(resource);
}

function getApplicationView() {
  const rows = getRows("applications").filter((row) => row.kind === "application");

  return {
    applications: rows.map((row) => {
      const entry = inflateRow(row);
      return {
        name: entry.name,
        url: entry.url,
        desc: entry.description,
      };
    }),
  };
}

function getSidebarView(resource) {
  const rows = getRows(resource);
  const groups = rows.filter((row) => row.kind === "group");

  return {
    items: groups.map((group) => {
      const groupEntry = inflateRow(group);
      const children = rows
        .filter((row) => row.kind === "child" && row.parent_name === group.name)
        .map((row) => inflateRow(row));

      return {
        name: groupEntry.name,
        logo: groupEntry.icon || groupEntry.logo,
        children: children.map((child) => ({
          name: child.name,
          url: child.url,
          logo: child.icon || child.logo,
          desc: child.description,
          configs: child.configs ?? [],
          yaml: child.yaml,
        })),
      };
    }),
  };
}

function getInfrastructureView() {
  const rows = getRows("infrastructure").map((row) => inflateRow(row));
  const collections = [...new Set(rows.map((row) => row.collection).filter(Boolean))];

  return collections.reduce((view, collection) => {
    view[collection] = rows
      .filter((row) => row.collection === collection)
      .map((row) => ({
        ...row,
        logo: row.icon || row.logo,
      }));
    return view;
  }, {});
}

function getPlatformView() {
  const rows = getRows("platform").map((row) => inflateRow(row));
  const platforms = rows.filter((row) => row.kind === "platform");

  return {
    platforms: platforms.map((platform) => {
      const clusters = rows.filter(
        (row) => row.kind === "cluster" && row.parentName === platform.name
      );

      return {
        name: platform.name,
        url: platform.url,
        icon: platform.icon || platform.logo,
        desc: platform.description,
        clusters: clusters.map((cluster) => ({
          name: cluster.name,
          url: cluster.url,
          icon: cluster.icon || cluster.logo,
          details: cluster.details ?? {},
        })),
      };
    }),
  };
}

function getSoftwareView() {
  const rows = getRows("software").map((row) => inflateRow(row));
  const softwares = rows.filter((row) => row.kind === "software");

  return {
    softwares: softwares.map((software) => {
      const children = rows.filter(
        (row) => row.parentName === software.name && row.kind === "service"
      );

      return {
        name: software.name,
        url: software.url,
        desc: software.description,
        icon: software.icon || software.logo,
        configs: software.configs ?? [],
        yaml: software.yaml,
        children: children.map((child) => ({
          name: child.name,
          url: child.url,
          icon: child.icon || child.logo,
        })),
      };
    }),
  };
}

function getHardwareView() {
  const rows = getRows("hardware").map((row) => inflateRow(row));
  const categories = [...new Set(rows.map((row) => row.collection).filter(Boolean))];

  return categories.reduce(
    (view, category) => {
      view[category] = rows
        .filter((row) => row.collection === category)
        .map((row) => ({
          ...row,
          icon: row.icon || row.logo,
        }));
      return view;
    },
    { categories }
  );
}

function normalizeEntryBody(body) {
  const resource = String(body.resource ?? "").trim();
  const kind = String(body.kind ?? "entry").trim();
  const collection = String(body.collection ?? body.category ?? "").trim();
  const parentName = String(body.parentName ?? body.parent_name ?? "").trim();
  const name = String(body.name ?? body.title ?? "").trim();
  const url = String(body.url ?? "").trim();
  const description = String(body.description ?? body.desc ?? body.about ?? "").trim();
  const icon = String(body.icon ?? "").trim();
  const logo = String(body.logo ?? "").trim();
  const sortOrderValue = Number(body.sortOrder ?? body.sort_order ?? 0);
  const sortOrder = Number.isFinite(sortOrderValue) ? sortOrderValue : 0;

  const payload = splitKnownFields(
    body,
    new Set([
      "resource",
      "kind",
      "collection",
      "category",
      "parentName",
      "parent_name",
      "name",
      "title",
      "url",
      "description",
      "desc",
      "about",
      "icon",
      "logo",
      "sortOrder",
      "sort_order",
    ])
  );

  return {
    resource,
    kind,
    collection: collection || null,
    parent_name: parentName || null,
    name,
    url: url || null,
    description: description || null,
    icon: icon || null,
    logo: logo || null,
    sort_order: sortOrder,
    payload: JSON.stringify(payload),
  };
}

function createEntry(body) {
  const row = normalizeEntryBody(body);

  if (!row.resource) {
    throw new Error("resource is required");
  }

  if (!row.name) {
    throw new Error("name is required");
  }

  const statement = db.prepare(`
    INSERT INTO entries (
      resource,
      kind,
      collection,
      parent_name,
      name,
      url,
      description,
      icon,
      logo,
      sort_order,
      payload
    ) VALUES (
      @resource,
      @kind,
      @collection,
      @parent_name,
      @name,
      @url,
      @description,
      @icon,
      @logo,
      @sort_order,
      @payload
    )
  `);

  const result = statement.run(row);
  return inflateRow({ id: result.lastInsertRowid, ...row });
}

seedDatabase();
ensureHardwareSeed();

export {
  createEntry,
  db,
  getApplicationView,
  getHardwareView,
  getInfrastructureView,
  getPlatformView,
  getSidebarView,
  getSoftwareView,
};