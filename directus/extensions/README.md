# Custom Extensions for Directus

This directory contains custom extensions for Directus.

## ping Extension

A simple health check endpoint at `/studio/ping` that responds with "pong" to verify the server and custom extensions are running.

## dapi Extensions

| Endpoint                       | Method | Description                             |
| ------------------------------ | ------ | --------------------------------------- |
| /studio/dapi/schema/tables            | GET    | List all tables with row counts         |
| /studio/dapi/schema/tables/:tableName | GET    | Get schema details for a specific table |

## dhooks Extensions

| Hook          | Description                                                      |
| ------------- | ---------------------------------------------------------------- |
| users.create  | Assigns default role 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a' to newly created users |
