import express from "express";
import bodyParser from "body-parser";
import path from "path";



const __dirname=path.resolve();
const app = express();
const PORT = process.env.PORT || 5000; // Choose a port for your server




app.use(bodyParser.json());

let transactions = [];

// Endpoint to get all transactions
app.get("/api/transactions", (req, res) => {
  try {
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

app.get("/api/health", (req, res) => {
  res.status(200).json("Server is up!!");
});

// Endpoint to save a new transaction
app.post("/api/transactions", (req, res) => {
  const newTransaction = req.body;

  try {
    transactions.push(newTransaction);
    res.status(200).json(transactions);

  } catch (error) {
    res.status(400).json(error.message);
  }
});

app.delete("/api/transactions/:id", (req, res) => {
  const { id } = req.params;

  try {
    // Find the index of the transaction with the specified ID
    const transactionIndex = transactions.findIndex(
      (transaction) => transaction.id === id
    );

    // If the transaction is found, remove it
    if (transactionIndex !== -1) {
      transactions.splice(transactionIndex, 1);
      res.status(200).json(transactions);
    } else {
      res.status(404).json({ error: "Transaction not found" });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

app.use(express.static(path.join(__dirname,'/client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
  });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
