# 🚀 Job Posting and Management API

A **Node.js & Express-based** backend system for a **job posting platform**.  
This API allows **employers** to **create, update, retrieve, and delete** job postings, while **candidates** can **search and apply** for jobs.

---

## 🎯 Features

✅ **Job Management** (CRUD operations for job postings)  
✅ **Employer Authentication** (Register & Login)  
✅ **Application Tracking** (Candidates can apply for jobs)  
✅ **Job Search API** (title, location, salary range)  
✅ **RESTful API** with **Swagger Documentation**  
✅ **Dockerized Deployment** with **MongoDB**  
✅ **Real-time Notifications** via **Socket.IO**  
✅ **Google Cloud Platform (GCP) Deployment Ready**  

---

# 🏗️ Setup & Installation

### 🛠️ Prerequisites

Ensure you have the following installed:

| Dependency | Version |
|------------|---------|
| **Node.js** | `>=16.x` |
| **MongoDB** | Local or Docker |
| **Yarn** | `npm install -g yarn` |

### 🔹 Clone the Repository

```bash
git clone https://github.com/tanvir084/job-posting-api.git
cd job-posting-api
```

### 🔹 Install Dependencies

```bash
yarn install
```

### 🔹 Create & Configure `.env` File

```bash
cp .env.example .env
```
Modify `.env` with your **MongoDB URI, JWT secret,** and other configurations.

### 🔹 Start MongoDB Locally (If not using Docker)

```bash
mongod --dbpath=data/db
```

### 🔹 Start the Application

```bash
yarn start
```
API will be available at **[`http://localhost:3000/`](http://localhost:3000/)**.

---

# 📦 Dockerized Setup

### 🚀 Run the Application with Docker

```bash
docker compose up --build -d
```
✅ API: **[`http://localhost:3000/`](http://localhost:3000/)**  
✅ MongoDB: **Running inside Docker on port `27017`**

### 🛑 Stop the Application

```bash
docker compose down
```

---

# 📖 API Documentation

Swagger UI is available at:  
🔗 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

---

# 📂 Project Structure

```
📦 job-posting-api
 ┣ 📂 models        # Mongoose Schemas
 ┣ 📂 routes        # API Routes
 ┣ 📂 middleware    # Authentication & Authorization
 ┣ 📂 swagger       # API Documentation
 ┣ 📜 server.js     # Main Express App
 ┣ 📜 Dockerfile    # Docker Setup
 ┣ 📜 docker-compose.yaml
 ┣ 📜 socket-test.js # 🔥 Test real-time notifications
 ┣ 📜 .gitignore
 ┣ 📜 README.md
```

---

# 🔥 API Endpoints

## 🔑 Authentication

| Method | Endpoint                 | Description |
|--------|--------------------------|-------------|
| `POST` | `/api/auth/register`      | Register employer |
| `POST` | `/api/auth/login`         | Employer login |

## 📋 Job Management (Employers)

| Method   | Endpoint               | Description |
|----------|------------------------|-------------|
| `POST`   | `/api/jobs`            | Create a new job posting |
| `GET`    | `/api/jobs`            | Retrieve all jobs |
| `GET`    | `/api/jobs/{id}`       | Retrieve a job by ID |
| `PUT`    | `/api/jobs/{id}`       | Update a job posting |
| `DELETE` | `/api/jobs/{id}`       | Delete a job posting |

## 🏆 Job Search & Applications (Candidates)

| Method | Endpoint                          | Description |
|--------|-----------------------------------|-------------|
| `GET`  | `/api/jobs?title=&location=&minSalary=&maxSalary=` | Search jobs |
| `POST` | `/api/applications/{jobId}/apply` | Apply for a job |

---

# 🔑 Environment Variables (`.env`)

```env
PORT=3000
MONGO_URI=mongodb://mongodb:27017/job_platform
SECRET_KEY=your_jwt_secret
```

---

# 🔥 Testing Real-Time Notifications

A **test client** is available to verify **real-time job application notifications**.  
📜 **File**: `socket-test.js`  

### 🛠️ **How to Test:**

1️⃣ **Ensure the API is running**  
```bash
yarn start
```
OR (if using Docker)  
```bash
docker compose up --build -d
```

2️⃣ **Replace the employerId in `socket-test.js` with an actual employer ID**  
- You can find a valid employer ID in your MongoDB database:
  ```bash
  db.employers.findOne()
  ```
- Or get an ID from the `/api/auth/register` or `/api/auth/login` API response.

3️⃣ **Run the Socket.IO Test Client**  
```bash
node socket-test.js
```

4️⃣ **Apply for a Job via API (`/api/applications/{jobId}/apply`)**  
- When a candidate applies, the test script will log:  
```bash
Received new application: { jobId, candidateName, candidateEmail }
```

---

# ☁️ Cloud Deployment: Google Cloud Platform (GCP)

## 🏗️ Deploy Using Google Kubernetes Engine (GKE)

Push the **Docker image** to **Google Container Registry (GCR)**:
```bash
docker tag job-platform gcr.io/YOUR_PROJECT_ID/job-platform
docker push gcr.io/YOUR_PROJECT_ID/job-platform
```
Deploy on **GKE**:
```bash
kubectl apply -f k8s/job-platform-deployment.yaml
```

## 🚀 Deploy Using Google Cloud Run

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/job-platform
gcloud run deploy job-platform --image gcr.io/YOUR_PROJECT_ID/job-platform --platform managed --allow-unauthenticated
```

---

# 🤝 Contributing

1. **Fork** the repository.  
2. **Create a new branch** (`git checkout -b feature-branch`).  
3. **Commit your changes** (`git commit -m "Added new feature"`).  
4. **Push to GitHub** (`git push origin feature-branch`).  
5. **Open a Pull Request** 🎉.

---

# 📜 License

This project is licensed under the **MIT License**.