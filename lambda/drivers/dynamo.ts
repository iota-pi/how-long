import AWS from 'aws-sdk';

export const CACHE_TABLE_NAME = process.env.CACHE_TABLE || 'HowLongCache';

export const MAX_ITEM_SIZE = 50000;

export interface DynamoOptions extends AWS.DynamoDB.ClientConfiguration {}

export interface CacheItem {
  reference: string,
  data: string,
}

export default class DynamoDriver<T = DynamoOptions> {
  private client: AWS.DynamoDB.DocumentClient | undefined;

  async init(_options?: T) {
    const options = getConnectionParams(_options);
    const ddb = new AWS.DynamoDB(options);

    try {
      await ddb.createTable(
        {
          TableName: CACHE_TABLE_NAME,
          KeySchema: [
            {
              AttributeName: 'reference',
              KeyType: 'HASH',
            },
          ],
          AttributeDefinitions: [
            {
              AttributeName: 'reference',
              AttributeType: 'S',
            },
          ],
          BillingMode: 'PAY_PER_REQUEST',
        },
      ).promise();
    } catch (err: any) {
      if (err.code !== 'ResourceInUseException') {
        throw err;
      }
    }

    return this;
  }

  connect(_options?: T): DynamoDriver {
    const options = getConnectionParams(_options);
    this.client = new AWS.DynamoDB.DocumentClient(options);
    return this;
  }

  async set(item: CacheItem) {
    if (!item.reference || !item.data) {
      throw new Error(
        `Reference ("${item.reference}") and data ("${item.data}") cannot be blank`,
      );
    }
    if (item.data.length > MAX_ITEM_SIZE) {
      throw new Error(`Item length (${item.data.length}) exceeds maximum (${MAX_ITEM_SIZE})`);
    }

    await this.client?.put(
      {
        TableName: CACHE_TABLE_NAME,
        Item: item,
      },
    ).promise();
  };

  async get(reference: string) {
    const response = await this.client?.get(
      {
        TableName: CACHE_TABLE_NAME,
        Key: { reference },
      },
    ).promise();
    if (response?.Item) {
      return response.Item as CacheItem;
    }
  };

  async delete(reference: string) {
    await this.client?.delete({
      TableName: CACHE_TABLE_NAME,
      Key: { reference },
    }).promise();
  }
}

export function getConnectionParams(options?: DynamoOptions): DynamoOptions {
  const customEndpoint = !!process.env.DYNAMODB_ENDPOINT;
  const endpointArgs: DynamoOptions = customEndpoint ? {
    endpoint: process.env.DYNAMODB_ENDPOINT,
    credentials: { accessKeyId: 'foo', secretAccessKey: 'bar' },
  } : {};
  return {
    region: 'ap-southeast-2',
    ...endpointArgs,
    ...options,
  };
}
