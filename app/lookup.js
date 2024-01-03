const {MongoClient} = require('mongodb');

run().catch(error => console.error(error.stack));

async function run (){
    const client = await MongoClient.connect('mongodb://localhost:27017/test');
    const db = client.db('test');

    await db.dropDatabase();

      // Create 2 users
  const users = [
    { name: 'Benjamin Graham' },
    { name: 'Warren Buffett' }
  ];
  await db.collection('User').insertMany(users);

  // Create 4 stocks with their approximate `currentPrice`
  const stocks = [
    { ticker: 'AAPL', currentPrice: 172.5 },
    { ticker: 'ORCL', currentPrice: 51 },
    { ticker: 'BRK.B', currentPrice: 202 },
    { ticker: 'LMT', currentPrice: 360 }
  ];
  await db.collection('Stock').insertMany(stocks);

  // Create a many-to-many mapping of users to the stocks they hold, with
  // the `basePrice` that they originally bought the stock at
  const stockHoldings = [
    { userId: users[0]._id, stock: 'AAPL', shares: 5, basePrice: 170 },
    { userId: users[0]._id, stock: 'ORCL', shares: 10, basePrice: 50 },
    { userId: users[1]._id, stock: 'BRK.B', shares: 5, basePrice: 200 },
    { userId: users[1]._id, stock: 'LMT', shares: 5, basePrice: 370 }
  ];
  await db.collection('StockHolding').insertMany(stockHoldings);

  const docs = await db.collection('StockHolding').aggregate([
    {
      $lookup: {
        from: 'Stock',
        localField: 'stock',
        foreignField: 'ticker',
        as: 'stock'
      }
    },
    {
      $unwind: '$stock'
    },
    {
      $project: {
        _id: 0,
        ticker: '$stock.ticker',
        currentPrice: '$stock.currentPrice',
        basePrice: 1,
        shares: 1
      }
    }
  ]).toArray();

  // [ { shares: 5, basePrice: 170, ticker: 'AAPL', currentPrice: 172.5 },
  //   { shares: 10, basePrice: 50, ticker: 'ORCL', currentPrice: 51 },
  //   { shares: 5, basePrice: 200, ticker: 'BRK.B', currentPrice: 202 },
  //   { shares: 5, basePrice: 370, ticker: 'LMT', currentPrice: 360 } ]
  console.log(docs);
  
}