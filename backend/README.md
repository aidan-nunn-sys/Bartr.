# Bartr Backend

This is the backend service for Bartr, a trading marketplace application.

## Technology Stack

- Java 17
- Spring Boot 3.2.0
- Spring Data JPA
- H2 Database (dev) / PostgreSQL (prod)
- Maven

## Development Setup

### Prerequisites

- JDK 17 or higher
- Maven 3.6+

### Running locally

```bash
cd backend
mvn spring-boot:run
```

The application will start on `http://localhost:8080/api` with the following endpoints:

- Health check: `GET /api/health`
- H2 Console: `http://localhost:8080/api/h2-console` (dev profile only)

### Building

```bash
mvn clean package
```

## Project Structure

```
src/main/java/com/bartr/
├── BartrApplication.java        # Main application class
├── controller/                  # REST controllers
├── model/                      # Entity classes
├── repository/                 # Data access layer
└── service/                    # Business logic layer
```