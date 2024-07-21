
const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'personal_db';
let db;

MongoClient.connect(mongoUrl)
    .then((client) => {
        db = client.db(dbName);
        console.log('Connected to database');
    })
    .catch((err) => {
        console.log('Error connecting to database:', err);
        process.exit(1);
    });


app.use(express.static('ASSESSMENT 7 AND 8'));



app.get('/', function (req, res) {
    res.sendFile(__dirname + "/front.html");
});


app.post('/insert', async function (req, res) {
    const { rollno, fname, lname, email, mobile, state } = req.body;
    if (!db) {
        res.status(500).send('Database not initialized');
        return;
    }
    try {
        await db.collection('personal_info').insertOne({ rollno, fname, lname, email, mobile, state });
        res.status(200).json({ message: 'Data inserted successfully' });
    } catch (err) {
        console.log('Error inserting data:', err);
        res.status(500).json({ message: 'Failed to insert data' });
    }
});

app.post('/update', async function (req, res) {
    const { rollno, fname, lname, email, mobile, state } = req.body;
    if (!db) {
        res.status(500).send('Database not initialized');
        return;
    }
    try {
        await db.collection('personal_info').updateOne({ rollno: rollno}, { $set: { fname, lname, email, mobile, state } });
        res.status(200).json({ message: 'Data updated successfully' });
    } catch (err) {
        console.log('Error updating data:', err);
        res.status(500).json({ message: 'Failed to update data' });
    }
});

app.post('/delete', async function (req, res) {
    const rollno = req.body.rollno;
    if (!db) {
        res.status(500).send('Database not initialized');
        return;
    }
    try {
        await db.collection('personal_info').deleteOne({ rollno: rollno });
        res.status(200).json({ message: 'Data deleted successfully' });
    } catch (err) {
        console.log('Error deleting data:', err);
        res.status(500).json({ message: 'Failed to delete data' });
    }
});

app.post('/read', async (req, res) => {
    const { rollno } = req.body;
    if (!db) {
        res.status(500).send('Database not initialized');
        return;
    }
    try {
        const student = await db.collection('personal_info').findOne({ rollno: rollno });

        if (student) {
            res.send(`
                <html>
                    <head>
                        <title>Student Details</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background: #f4f4f4;
                                margin: 0;
                                padding: 20px;
                            }
                            .container {
                                background: #fff;
                                padding: 20px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                max-width: 600px;
                                margin: auto;
                                border-radius: 8px;
                            }
                            h1 {
                                color: #333;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-top: 20px;
                            }
                            th, td {
                                padding: 12px;
                                border: 1px solid #ddd;
                            }
                            th {
                                background: #4CAF50;
                                color: white;
                                text-align: left;
                            }
                            tr:nth-child(even) {
                                background: #f9f9f9;
                            }
                            .back-button {
                                display: inline-block;
                                margin-top: 20px;
                                padding: 10px 20px;
                                background: #4CAF50;
                                color: white;
                                text-decoration: none;
                                border-radius: 4px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Student Details</h1>
                            <table>
                                <tr>
                                    <th>Roll No</th>
                                    <td>${student.rollno}</td>
                                </tr>
                                <tr>
                                    <th>First Name</th>
                                    <td>${student.fname}</td>
                                </tr>
                                <tr>
                                    <th>Last Name</th>
                                    <td>${student.lname}</td>
                                </tr>
                                <tr>
                                    <th>Email</th>
                                    <td>${student.email}</td>
                                </tr>
                                <tr>
                                    <th>Mobile</th>
                                    <td>${student.mobile}</td>
                                </tr>
                                <tr>
                                    <th>State</th>
                                    <td>${student.state}</td>
                                </tr>
                            </table>
                            <a class="back-button" href="/">Back</a>
                        </div>
                    </body>
                </html>
            `);
        } else {
            res.send(`
                <html>
                    <head>
                        <title>Student Details</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background: #f4f4f4;
                                margin: 0;
                                padding: 20px;
                            }
                            .container {
                                background: #fff;
                                padding: 20px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                max-width: 600px;
                                margin: auto;
                                border-radius: 8px;
                            }
                            h1 {
                                color: #333;
                            }
                            .back-button {
                                display: inline-block;
                                margin-top: 20px;
                                padding: 10px 20px;
                                background: #4CAF50;
                                color: white;
                                text-decoration: none;
                                border-radius: 4px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>No student found with roll number ${rollno}</h1>
                            <a class="back-button" href="/">Back</a>
                        </div>
                    </body>
                </html>
            `);
        }
    } catch (err) {
        console.log('Error executing query', err);
        res.status(500).send('Error reading data');
    }
});


app.get('/report', async function (req, res) {
    if (!db) {
        res.status(500).send('Database not initialized');
        return;
    }
    try {
        const results = await db.collection('personal_info').find({ fname: { $in: ['devasri', 'gobika'] } }).toArray();
        res.send(`
            <html>
                <head>
                    <title>Report</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                            background: #f4f4f4;
                            
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        th, td {
                            padding: 10px;
                            border: 1px solid #ddd;
                        }
                        th {
                            background: #4CAF50;
                            color: white;
                        }
                        tr:nth-child(even) {
                            background: #f2f2f2;
                        }
                    </style>
                </head>
                <body>
                    <h1>Student Report</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Email</th>
                                <th>Mobile</th>
                                <th>State</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${results.map(result => `
                                <tr>
                                    <td>${result.rollno}</td>
                                    <td>${result.fname}</td>
                                    <td>${result.lname}</td>
                                    <td>${result.email}</td>
                                    <td>${result.mobile}</td>
                                    <td>${result.state}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <button onclick="window.location.href='/'">Back</button>
                </body>
            </html>
        `);
    } catch (err) {
        console.log('Error generating report:', err);
        res.status(500).send('Failed to generate report');
    }
});

app.listen(9000, () => {
    console.log('Server is running on port 9000');
});
