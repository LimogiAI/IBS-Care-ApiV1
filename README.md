# 🩺 IBS-Care-ApiV1

A Clinical Decision Support (CDS) API powered by [Hono](https://hono.dev/) and [Bun](https://bun.sh/), designed to handle patient-related hooks, discovery services, and health check endpoints.

---

## 🚀 **Getting Started**

### ⚙️ **Prerequisites**
- **Bun**: Ensure you have [Bun](https://bun.sh/docs/installation) installed.

```bash
bun --version
```

---

### 📦 **Installation**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/LimogiAI/IBS-Care-ApiV1.git
   cd IBS-Care-ApiV1.git
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

---

### 📂 **Environment Setup**

1. **Environment Variables:**
   - `.env` (for local development)
   - `.env.example` (as a template for other developers)

2. **Sample `.env` Configuration:**
   ```env
   NODE_ENV=development
   PORT=4433
   ```

---

### 🚀 **Running the Server**

#### ✅ **Development Mode (with Hot Reloading):**
```bash
bun run dev
```
- Opens the server at: [http://localhost:4433](http://localhost:4433)

#### 🚀 **Production Mode:**
```bash
bun run start
```
- Uses `NODE_ENV=production` from `.env` and runs without hot-reloading.

---

### 🌐 **Available Endpoints**

| **Endpoint**                  | **Description**                     | **Method** |
| ----------------------------- | ----------------------------------- | ---------- |
| `/health`                     | Health check endpoint               | `GET`      |
| `/cds-services/`              | CDS discovery services             | `GET`      |
| `/cds-services/:id`           | CDS hooks for patient data         | `POST`     |

Example:
```bash
curl http://localhost:4433/health
```

---

### 📊 **Logging**

- **Development:** Colorful logs powered by `pino-pretty`.
- **Production:** Structured JSON logs for easy parsing.

---

### 🐳 **Docker Support**

#### ✅ **Build the Docker Image:**
```bash
docker build -t ibs-care-api:v1.0.0 .
```

#### ✅ **Run the Docker Container:**
```bash
docker run -d -p 4433:4433 --name ibs-care-api ghcr.io/limogiai/ibs-care-api:v1.0.0
```

#### ✅ **Using Docker Compose:**

1. **Create a `docker-compose.yml` file:**
   ```yaml
   version: "3.8"

   services:
     ibs-care-api:
       image: ghcr.io/limogiai/ibs-care-api:v1.0.0
       container_name: ibs-care-api
       ports:
         - "4433:4433"
       environment:
         - NODE_ENV=production
         - PORT=4433
       restart: unless-stopped
   ```

2. **Run the Service:**
   ```bash
   docker-compose up -d
   ```

3. **Rebuild the Image and Restart the Service:**
   ```bash
   docker-compose up --build -d
   ```

- **Why `--build`?**
  - Forces Docker to rebuild the image from the Dockerfile.
  - Ensures the latest code and dependencies are included.
  - Ideal after code changes.

#### ✅ **Managing Docker Containers:**

- **View Logs:**
  ```bash
  docker-compose logs -f
  ```

- **Stop the Service:**
  ```bash
  docker-compose down
  ```

- **Restart the Service:**
  ```bash
  docker-compose restart
  ```

---

### 📝 **Contributing**

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch`.
3. Commit your changes: `git commit -m 'Add new feature'`.
4. Push to the branch: `git push origin feature-branch`.
5. Open a Pull Request.

---

### 🛠️ **Tech Stack**

- **Bun** - Fast JavaScript runtime
- **Hono** - Lightweight web framework
- **Pino** - High-performance logger

---

### 📄 **License**

This project is licensed under the [MIT License](./LICENSE).

