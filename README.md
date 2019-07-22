# tempRepo

Laravel with react app

## Prerequirements 
need docker to run locally

## Installation

To install laravel vendors

```bash
composer install
```
To install read node modules

```bash
npm install
```

## Usage

```bash
docker-compose up
```

To insert required tables
```bash
docker exec -it container_phpfpm_lara_react php artisan migrate
```