import express from 'express';
import bodyParser from 'body-parser';
import zlib from 'zlib';
import chalk from 'chalk';

const app = express();
const PORT = process.env.PORT || 3000;

// Use body-parser to parse JSON payloads with increased size limit
app.use(bodyParser.json({ limit: '50mb' }));

// Helper function to decompress and decode payload
function decodePayload(encodedData: string): string {
  try {
    // First, base64 decode the data
    const compressedBuffer = Buffer.from(encodedData, 'base64');
    
    // Decompress using gzip
    const decompressedBuffer = zlib.gunzipSync(compressedBuffer);
    
    // Convert to string
    return decompressedBuffer.toString('utf-8');
  } catch (error) {
    console.error(chalk.red('Error decoding payload:'), error);
    return 'Unable to decode payload';
  }
}

// Firehose endpoint handler
app.post('/firehose-debug', (req, res) => {
  // Timestamp for this request
  const requestTimestamp = Date.now();
  const requestId = req.body.requestId || 'unknown-request-id';

  // Log request header
  console.log(chalk.bgBlue.white.bold('=== NEW FIREHOSE PAYLOAD RECEIVED ==='));
  console.log(chalk.cyan(`Timestamp: ${new Date(requestTimestamp).toISOString()}`));
  console.log(chalk.gray('Request Details:'));
  console.log(chalk.gray(`  Request ID: ${requestId}`));
  console.log(chalk.gray(`  Total Records: ${req.body.records ? req.body.records.length : 0}`));

  try {
    // Decode and log specific parts of the payload if needed
    if (req.body && req.body.records) {
      req.body.records.forEach((record: any, index: number) => {
        console.log(chalk.bgGreen.black.bold(`\n--- Processing Record ${index + 1} ---`));
        
        // Decode the base64 gzipped data
        const decodedData = decodePayload(record.data);
        
        console.log(chalk.yellow('Raw Decoded Data:'));
        console.log(chalk.gray(decodedData));
        
        // Optional: Parse decoded data if it's JSON
        try {
          const parsedData = JSON.parse(decodedData);
          console.log(chalk.green('Parsed JSON Data:'));
          console.log(JSON.stringify(parsedData, null, 2));
        } catch {
          // If not JSON, it's fine to just log the raw decoded string
          console.log(chalk.yellow('Note: Decoded data is not valid JSON'));
        }
      });
    }

    // Log completion
    console.log(chalk.bgBlue.white.bold('\n=== PAYLOAD PROCESSING COMPLETE ==='));

    // Respond with success in expected schema
    res.status(200).json({
      requestId: requestId,
      timestamp: requestTimestamp
    });
  } catch (error) {
    console.error(chalk.red('Error processing Firehose payload:'), error);
    
    // Respond with failure in expected schema
    res.status(500).json({
      requestId: requestId,
      timestamp: requestTimestamp,
      errorMessage: 'Unable to deliver records due to unknown error.'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(chalk.green(`Firehose Debugger listening on port ${PORT}`));
});
