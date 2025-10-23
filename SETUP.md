# Directus Railway Development Setup

This project provides three different Docker Compose setups for Directus development:

## 1. Local Development (Remote Database)
Use this for development work that connects to the remote Railway database.

```bash
# Start development environment with remote database
docker-compose -f docker-compose.dev.yml up
```

**Features:**
- Connects to remote Railway PostgreSQL database
- Auto-reload extensions
- Development Dockerfile
- Redis cache

## 2. Local Development (Local Database)
Use this for isolated development with a local database.

```bash
# Start development environment with local database
docker-compose -f docker-compose.local.yml up
```

**Features:**
- Local PostgreSQL database
- Auto-reload extensions
- Development Dockerfile
- Redis cache
- Data persists in `./data/database/`

## 3. Staging Environment
Use this for staging/testing with production-like settings.

```bash
# Start staging environment
docker-compose -f docker-compose.staging.yml up
```

**Features:**
- Local PostgreSQL database
- Production Dockerfile
- Redis cache
- No auto-reload extensions

## Database Synchronization

Use the sync script to keep databases in sync:

```bash
# Sync from local to remote
./scripts/sync-database.sh local-to-remote

# Sync from remote to local
./scripts/sync-database.sh remote-to-local

# Compare database counts
./scripts/sync-database.sh compare
```

## Environment Configuration

The `.env` file contains all configuration for connecting to the remote Railway database and S3 storage.

## Development Workflow

1. **For schema development**: Use local database setup
2. **For data development**: Use remote database setup
3. **Sync changes**: Use sync script to move schema/data between environments
4. **Test in staging**: Use staging setup for final testing

## Ports

- Directus: http://localhost:8055
- Local PostgreSQL: 5432
- Redis: 6379

## Important Notes

- The remote database connection uses Railway's PostgreSQL instance
- S3 storage is configured for file uploads
- Make sure to backup data before syncing
- Use the compare command to verify sync operations