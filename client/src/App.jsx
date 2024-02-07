import React, { useState, useEffect } from 'react';
import { DatePicker, Input, Card, Button, Table, Row, Col } from 'antd';
import 'antd/dist/reset.css';
import { v4 as uuidv4 } from 'uuid';
import { saveAs } from 'file-saver';

function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionList, setTransactionList] = useState([]);

  const [interestRate, setInterestRate] = useState('');
  const [destinationDate, setDestinationDate] = useState(null);

  useEffect(() => {
    // Fetch saved transactions from the server when the component mounts
    fetchSavedTransactions();
  }, []);

  const fetchSavedTransactions = () => {
    
    fetch(`/api/transactions`)
      .then((response) => response.json())
      .then((data) => setTransactionList(data))
      .catch((error) => console.error('Error fetching saved transactions:', error));
  };

  const saveTransactionToBackend = (newTransaction) => {
    
    fetch(`/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTransaction),
    })
      .then((response) => response.json())
      .then((data) => setTransactionList(data))
      .catch((error) => console.error('Error saving transaction:', error));
  };

  const handleAddTransaction = () => {
    if (selectedDate && destinationDate && interestRate && transactionAmount) {
      const days = Math.floor((destinationDate - selectedDate) / (1000 * 60 * 60 * 24));
      const interest = parseFloat(interestRate) || 0;
      const principal = parseFloat(transactionAmount) || 0;
      const time = parseInt(days) || 0;
      const calculatedAmount = calculateAmount(principal, interest, time).toFixed(2);
      const newTransaction = {
        id: uuidv4(),
        date: selectedDate,
        amount: transactionAmount,
        days: days,
        amountCalc: calculatedAmount,
      };

      // Save the new transaction to the backend
      saveTransactionToBackend(newTransaction);

      setTransactionList((prevList) => [...prevList, newTransaction]);
    }
  };

  const handleRemoveTransaction = (id) => {
    // Send a request to your backend to remove the transaction with the given ID
    
    fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the local state with the modified transaction list
        setTransactionList(data);
      })
      .catch((error) => console.error('Error deleting transaction:', error));
  };

  const handleDownloadReport = () => {
    const csvContent = generateCSVContent(transactionList);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "transaction_report.csv");
  };

  const generateCSVContent = (data) => {
    const header = [
      "Date",
      "Transaction Amount",
      "Days Until Destination",
      "Amount",
    ].join(",");
    const rows = data.map((transaction) => {
      const { date, amount, days, amountCalc } = transaction;
      const formattedDate = formatDate(date);
      return [formattedDate, amount, days, amountCalc].join(",");
    });
    const content = [header, ...rows].join("\n");
    return content;
  };

  const formatDate = (date) => {
    const dateObj = new Date(date);
    const localDate = new Date(
      dateObj.getTime() - dateObj.getTimezoneOffset() * 60000
    );
    const dateString = localDate.toLocaleDateString();
    return dateString;
  };

  const calculateAmount = (principal, interest, time) => {
    const amount = principal * (1 + interest / 100) ** (time / 365);
    return amount;
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => formatDate(date),
    },
    {
      title: "Transaction Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Days Until Destination",
      dataIndex: "days",
      key: "days",
    },
    {
      title: "Amount",
      dataIndex: "amountCalc",
      key: "amountCalc",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Button type="link" onClick={() => handleRemoveTransaction(record.id)}>
          Remove
        </Button>
      ),
    },
  ];

  const calculateTotal = () => {
    const total = transactionList.reduce(
      (sum, transaction) => sum + parseFloat(transaction.amountCalc || 0),
      0
    );
    return total.toFixed(2);
  };



  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh",
        marginTop: 20, // Add margin at the top
      }}
    >
      <Row gutter={20}>
        <Col xs={24} sm={12} lg={12}>
          <Card
            title="Principal Transaction"
            style={{
              width: "100%",
              marginBottom: 20,
              padding: 20,
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <label>Date:</label>
              <br />
              <DatePicker
                style={{ width: "100%" }}
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
              />
            </div>
            <div>
              <label>Transaction Amount:</label>
              <br />
              <Input
                style={{ width: "100%" }}
                type="number"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={12}>
          <Card
            title="Interest Rate and Destination Date"
            style={{
              width: "100%",
              marginBottom: 20,
              padding: 20,
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <label>Rate of Interest (Annually):</label>
              <br />
              <Input
                style={{ width: "100%" }}
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>
            <div>
              <label>Destination Date:</label>
              <br />
              <DatePicker
                style={{ width: "100%" }}
                value={destinationDate}
                onChange={(date) => setDestinationDate(date)}
              />
            </div>
          </Card>
        </Col>
      </Row>
      <div>
            <Button
              type="primary"
              onClick={handleAddTransaction}
              // style={{ marginTop: 16 }}
            >
              Add Transaction
            </Button>
      </div>
      <Row gutter={20}>
        <Col span={24}>
          <Card
            title="Transaction List"
            style={{
              width: "100%",
              marginTop: 20,
              padding: 20,
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Table
              dataSource={transactionList}
              columns={columns}
              rowKey={(record) => record.id}
              footer={() => (
                <div style={{ textAlign: "right" }}>
                  <strong>Total:</strong> {calculateTotal()}
                </div>
              )}
            />
            <Button
              type="primary"
              onClick={handleDownloadReport}
              style={{ margin: 16 }}
            >
              Download Report
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default App;
