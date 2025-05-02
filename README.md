# AWS Firehose Endpoint Debugger

## Overview
This is a simple Express-based TypeScript server that helps debug AWS Firehose HTTP endpoint deliveries by:
- Receiving Firehose payloads
- Decoding base64 encoded records
- Printing payload details to console with enhanced visualization

## Context and Inspiration
This Proof of Concept (PoC) is directly related to the AWS announcement described in the blog post: [AWS Lambda Introduces Tiered Pricing for Amazon CloudWatch Logs and Additional Logging Destinations](https://aws.amazon.com/blogs/compute/aws-lambda-introduces-tiered-pricing-for-amazon-cloudwatch-logs-and-additional-logging-destinations/)

The project demonstrates a lightweight debugging mechanism for handling log delivery payloads, particularly focusing on:
- Decoding compressed log records
- Handling CloudWatch log exports
- Providing a flexible endpoint for log stream debugging

## Prerequisites
- Node.js
- npm
- (Optional) ngrok account

## Installation
1. Clone the repository
2. Run `npm install`

## Running the Server
- Development mode: `npm run dev`
- Production build: `npm run build` then `npm start`

## Endpoint
- POST `/firehose-debug`
- Accepts Firehose delivery payloads
- Logs entire payload and decoded record data with color-coded output

## Example Payload Structure
```json
{
  "records": [
    {
      "data": "base64EncodedData=="
    }
  ]
}
```

## Debugging Features
- Color-coded console output for better readability
- Detailed logging of:
  * Request timestamp
  * Request ID
  * Total number of records
  * Raw and parsed record data
- Supports gzip compressed and base64 encoded payloads
- JSON parsing for structured data

## Console Output Example
```
=== NEW FIREHOSE PAYLOAD RECEIVED ===
Timestamp: 2025-05-02T08:32:39.987Z
Request Details:
  Request ID: ff15de52-7605-44f6-91d8-442f91fed4f4
  Total Records: 1

--- Processing Record 1 ---
Raw Decoded Data:
{
  "messageType": "DATA_MESSAGE",
  "logGroup": "FunctionLogsToFirehose",
  "logStream": "2025/05/02/FunctionLogsToFirehose[$LATEST]...",
  "subscriptionFilters": ["lambda-logs-delivery"],
  "logEvents": [
    {
      "timestamp": 1746174748254,
      "message": "INIT_START Runtime Version: nodejs:22.v35..."
    },
    {
      "timestamp": 1746174748398,
      "message": "2025-05-02T08:32:28.398Z\tINFO\tHello World"
    },
    ...
  ]
}

=== PAYLOAD PROCESSING COMPLETE ===
```

## Exposing Local Server with Ngrok

### Setup Guide

1. **Install Ngrok**
   ```bash
   # macOS (using Homebrew)
   brew install ngrok/ngrok/ngrok

   # Or via npm
   npm install -g ngrok
   ```

2. **Create Ngrok Account**
   - Go to [ngrok.com](https://ngrok.com/)
   - Sign up for a free account
   - Download and install the ngrok CLI

3. **Authenticate Ngrok**
   ```bash
   # From ngrok dashboard, copy your auth token
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

4. **Start Local Server**
   ```bash
   npm run dev
   ```

5. **Expose Server with Ngrok**
   ```bash
   # Expose port 3000 to the internet
   ngrok http 3000
   ```

6. **Configure AWS Firehose/CloudWatch**
   - Use the generated ngrok HTTPS URL as your webhook endpoint
   - Example: `https://abc123.ngrok.app/firehose-debug`

### Notes
- Ngrok URLs are temporary and change on each restart
- For persistent URLs, consider Ngrok Pro or alternative services
- Ensure your local firewall allows incoming connections

## Security Considerations
- Do not expose sensitive endpoints publicly
- Use Ngrok's authentication features
- Be cautious with payload logging in production
