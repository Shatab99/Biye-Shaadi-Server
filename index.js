const express = require('express');
const cors = require('cors')
const port = process.env.PORT || 5000;
const app = express()
require("dotenv").config();
const stripe = require('stripe')('sk_test_51OFunvLooRhoamnLPKPDCVKlqiQif6AauFJC7l6ifwf7JdjB0vVIKGDF79KmAvmqT9JoD20CqkAoaHpa78KWsiXr00FiEcnRtd')
//middle ware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send("Welcome to Shaadi Server")
})



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.hhhxudw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const members = client.db('shaadiDB').collection('members')
        const requestCollections = client.db('shaadiDB').collection('Requests')
        const paymentCollections = client.db('shaadiDB').collection('Payments')
        const friendsCollection = client.db('shaadiDB').collection('friendsCollections')


        app.get('/members', async (req, res) => {
            const result = await members.find().toArray();
            res.send(result);
        })
        app.get('/membercount', async (req, res) => {
            const count = await members.estimatedDocumentCount()
            res.send({ count })
        })

        // for pagination on Admin users management 

        app.get('/managemembers', async (req, res) => {
            try {
                const searchTerm = req.query.q.split(' ');
                const page = parseInt(req.query.page);
                const limit = parseInt(req.query.limit);
                const skip = (page - 1) * limit;
                const result = await members.find({
                    email: { $in: searchTerm.map(term => new RegExp(term, 'i')) }
                }).skip(skip).limit(limit).toArray();
                res.send(result)
            }
            catch(error){
                console.log(error)
            }
        })

        //Check members 

        app.get('/checkmembers', async(req, res)=>{
            const result = await members.find().toArray()
            res.send(result)
        })




        app.get('/search', async (req, res) => {
            const searchTerm = req.query.q.split(' ')
            const result = await members.find({
                name: {
                    $in: searchTerm.map(term => (new RegExp(term, 'i')))
                }
            }).toArray();
            res.send(result)
        })

        app.post('/members', async (req, res) => {
            const userInfo = req.body;
            const query = { email: userInfo.email }
            const exists = await members.findOne(query);
            if (exists) {
                return res.send({ message: 'User Already Exists', insertedId: null })
            }
            const result = await members.insertOne(userInfo);
            res.send(result);
        })
        //admin check

        app.get('/members/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await members.findOne(query);
            res.send(result)
        })

        app.patch('/members/makeadmin/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await members.updateOne(query, updatedDoc);
            res.send(result)
        })

        app.delete('/members/deleteuser/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await members.deleteOne(query);
            res.send(result)
        })


        //sort by division

        app.get('/members/:division', async (req, res) => {
            const division = req.params.division;
            const result = await members.find({ division: division }).toArray();
            res.send(result);
        })

        // sort by gender

        app.get('/members/gender/:gender', async (req, res) => {
            const gender = req.params.gender;
            const result = await members.find({ gender: gender }).toArray();
            res.send(result);
        })

        app.get('/members/details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await members.findOne(query);
            res.send(result);
        })
        app.get('/members/checkrole/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await members.findOne(query);
            res.send(result)
        })

        app.get('/members/biodata/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await members.findOne(query)
            res.send(result)
        })

        app.patch('/members/biodata/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const updatedForm = req.body;
            const updatedDoc = {
                $set: {
                    name: updatedForm.name,
                    motherName: updatedForm.motherName,
                    fatherName: updatedForm.fatherName,
                    profile_pic: updatedForm.profile_pic,
                    dob: updatedForm.dob,
                    height: updatedForm.height,
                    weight: updatedForm.weight,
                    age: updatedForm.age,
                    occupation: updatedForm.occupation,
                    race: updatedForm.race,
                    division: updatedForm.division,
                    gender: updatedForm.gender,
                    phone: updatedForm.phone,
                    partnerAge: updatedForm.partnerAge,
                    partnerHeight: updatedForm.partnerHeight,
                    contactEmail: updatedForm.contactEmail,
                    presentDivision: updatedForm.presentDivision,
                    requestUser: updatedForm.requestUser
                }
            }
            const result = await members.updateOne(query, updatedDoc);
            res.send(result)
        })

        //premium members
        app.get('/memberpremium', async (req, res) => {
            const result = await members.find({ member: 'premium' }).toArray();
            res.send(result);
        })

        //requests on members 
        app.get('/requests/:email', async (req, res) => {
            const requestEmail = req.params.email;
            const query = { requestEmail: requestEmail }
            const result = await requestCollections.find(query, { unique: true }).toArray();
            res.send(result)
        })

        app.get('/requests/seebio/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await requestCollections.findOne(query);
            res.send(result)
        })

        app.post('/requests', async (req, res) => {
            const doc = req.body;
            // const requestEmail = req.body.requestEmail;
            // const requestedEmail = req.body.requestedEmail;
            // const query = requestEmail && requestedEmail ;
            // const exists = await requestCollections.findOne(query);
            // if(exists){
            //     return res.send({message:'already Exists', insertedId:null})
            // }
            const result = await requestCollections.insertOne(doc);
            res.send(result)
        })

        app.get('/requests/favorites/:email', async (req, res) => {
            const requestedEmail = req.params.email;
            const query = { requestedEmail: requestedEmail }
            const result = await requestCollections.find(query).toArray();
            res.send(result)
        })

        app.patch('/requests/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const doc = req.body;
            console.log(doc)
            const updatedDoc = {
                $set: {
                    status: doc.status
                }
            }
            const result = await requestCollections.updateOne(query, updatedDoc);
            res.send(result);
        })

        app.delete('/requests/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await requestCollections.deleteOne(query);
            res.send(result)
        })

        //payment intent
        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;
            const amount = parseInt(price * 100)
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            })

            res.send({
                clientSecret: paymentIntent.client_secret
            })
        })

        //save transaction info to database

        app.get('/payments', async (req, res) => {
            const result = await paymentCollections.find().toArray();
            res.send(result)
        })

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentCollections.insertOne(payment)
            console.log(payment)
            res.send(result)
        })

        app.patch('/payments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const doc = req.body;
            const updatedDoc = {
                $set: {
                    status: doc.status
                }
            }
            const result = await paymentCollections.updateOne(query, updatedDoc)
            res.send(result)

        })

        app.patch('/members/makepremium/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const doc = req.body;
            const updatedDoc = {
                $set: {
                    member: doc.member
                }
            }
            const result = await members.updateOne(query, updatedDoc)
            res.send(result)
        })

        app.delete('/payments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await paymentCollections.deleteOne(query);
            res.send(result)
        })
        // See who are friends 
        app.get('/friends', async(req, res)=>{
            const email = req.query.email;
            const result = await friendsCollection.find({requestEmail : email}).toArray()
            res.send(result)
        })

        app.post('/friends', async(req, res)=>{
            const result = await friendsCollection.insertOne(req.body)
            res.send(result)
        })


        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.listen(port, () => {
    console.log("Server Listing At ", port)
})

