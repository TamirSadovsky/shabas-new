
// Sending signature and comments data to the db
app.post('/signedOrder', async (req, res) => {
    const requestData = req.body;
    try {
        const data = await sql.pool
            .request()
            .input('orderID', sql.SQLInst.Int, requestData.orderId)
            .input('SigBase64', sql.SQLInst.VarChar, requestData.Sig)
            .input('comment', sql.SQLInst.VarChar, requestData.comment)
            .query("INSERT INTO OrderSig(orderID, Sig, comment, SigBase64) values(@orderID, null, @comment, @SigBase64)")
        res.status(200).send(await data);
    } catch (e) {
        console.log("Error occured: ", e)
        res.status(500).send(e);
    }
});

app.post('/Login', async (req, res) => {
    const requestData = req.body;
    try {
        const data = await sql.pool
            .request()
            .input('WorkerName', sql.SQLInst.VARCHAR, requestData.WorkerName)
            .query('SELECT * FROM Workers WHERE WorkerName = @WorkerName');
        const userData = await data;
        if (userData.recordset[0]) {
            const currentPass = userData.recordset[0].PassWord == requestData.PassWord ? true : false;
            if (currentPass) {
                const data2 = await sql.pool
                    .request()
                    .query('SELECT * FROM LocalDef');
                const localDef = await data2.recordset[0];
                res.status(200).send({
                    authenticated: currentPass,
                    userId: userData.recordset[0].WorkerID,
                    username: userData.recordset[0].WorkerName,
                    needKuser: localDef.DoNotNeedKuse ? false : true,
                    localDef: localDef,
                    maxAllow: userData.recordset[0].UpAllow,
                    minAllow: userData.recordset[0].DownAllow
                });
                return;
            }
            res.status(200).send("not found");
            return;
        }
        res.status(200).send("not found");
    } catch (e) {
        console.log("Error occured: ", e)
        res.status(500).send(e);
    }
});


// check for an already signed order.
const alreadySigned = async (requestData) => {
    try {
        const data = await sql.pool
            .request()
            .input('orderID', sql.SQLInst.Int, requestData.orderId)
            .query("SELECT * FROM OrderSig WHERE orderID = @orderID")
        if (data.recordset[0] && data.recordset[0].SigBase64 != null) {
            return { isSinged: true, signatureBASE64: data.recordset[0].SigBase64, comment: data.recordset[0].Comment };
        }
        return { isSinged: false, signatureBASE64: null, comment: null };
    } catch (e) {
        console.log("Error finding already singed order error: ", e);
        return { isSinged: false, signatureBASE64: null, comment: null };
    }
}
// Start of routes for new order process 

//  Getting possible costumers names from db
app.get('/getCustomers', async (req, res) => {
    try {
        const data = await sql.pool
            .request()
            .query("SELECT CustomerID,Name,Address,City,ZipCode FROM Customers WHERE NotActive = 0")
        res.status(200).send(await data.recordset);
    } catch (e) {
        console.log("Error occured: ", e)
        res.status(500).send(e);
    }
});

//  Getting five last orders by customer id from db
app.get('/getOrdersByCustomer', async (req, res) => {
    const requestData = req.query;
    try {
        const data = await sql.pool
            .request()
            .input('CustomerID', sql.SQLInst.Int, requestData.customerID)
            .query("SELECT * FROM Order_From_Cust_Main WHERE CustomerID = @CustomerID");
        let resolvedMainOrders = await data.recordset;
        resolvedMainOrders = resolvedMainOrders.slice(-5);
        const userOrders = [...resolvedMainOrders];
        if (resolvedMainOrders) {
            for (let i = 0; i < resolvedMainOrders.length; i++) {
                const data2 = await sql.pool
                    .request()
                    .input('CustOrderID', sql.SQLInst.Int, resolvedMainOrders[i].CustOrderID)
                    .query("SELECT * FROM Order_From_Cust_Lines WHERE CustOrderID = @CustOrderID");
                const resolvedOrders = await data2.recordset;
                userOrders[i].lines = [...resolvedOrders];
            }

        }

        res.status(200).send(userOrders);
    } catch (e) {
        console.log("Error occured: ", e)
        res.status(500).send(e);
    }
});
//  Getting pending orders (last two days) of customer id from db
app.get('/getPendingOrdersByUser', async (req, res) => {
    const requestData = req.query;
    try {
        const data = await sql.pool
            .request()
            .input('UserID', sql.SQLInst.Int, requestData.userID)
            .query("SELECT * FROM Order_From_Cust_Main_Pending WHERE UserID = @UserID");
        const resolvedMainPendingOrders = await data.recordset;
        let userPendingOrders = [...resolvedMainPendingOrders];
        const today = new Date();
        userPendingOrders = userPendingOrders.filter(order => {
            return today.getDate() - order.Date.getDate() < 3 && //need to take in consider what happens at month/year first days
                today.getMonth() === order.Date.getMonth() &&
                today.getFullYear() === order.Date.getFullYear();
        })

        // console.log(userPendingOrders.length);
        // if (userPendingOrders) {
        //     for (let i = 0; i < userPendingOrders.length; i++) {
        //         const data2 = await sql.pool
        //             .request()
        //             .input('CustOrderID', sql.SQLInst.Int, userPendingOrders[i].CustOrderID)
        //             .query("SELECT * FROM Order_From_Cust_Lines_Pending WHERE CustOrderID = @CustOrderID");
        //         const resolvedPendingOrders = await data2.recordset;
        //         userPendingOrders[i].lines = [...resolvedPendingOrders];
        //     }

        // }
        res.status(200).send(userPendingOrders);
    } catch (e) {
        res.status(500).send(e);
    }
});

//  Getting items from db
app.get('/getItems', async (req, res) => {
    console.log(`Getting items...`);
    try {
        const data = await sql.pool
            .request()
            .query("SELECT * FROM PartsPics");
        const items = await data.recordset;
        res.status(200).send(items);
    } catch (e) {
        console.log("Error occured: ", e)
        res.status(500).send(e);
    }
});

//  Getting units from db
app.get('/getUnits', async (req, res) => {
    console.log(`Getting units...`);
    try {
        const data = await sql.pool
            .request()
            .query("SELECT * FROM UnitsDef");
        const units = await data.recordset;
        res.status(200).send(units);
    } catch (e) {
        console.log("Error occured: ", e)
        res.status(500).send(e);
    }
});

//  Getting kuser types from db
app.get('/getKusers', async (req, res) => {
    console.log(`Getting kusers...`);
    try {
        const data = await sql.pool
            .request()
            .query("SELECT * FROM Kuser");
        const kusers = await data.recordset;
        res.status(200).send(kusers);
    } catch (e) {
        console.log("Error occured: ", e)
        res.status(500).send(e);
    }
});

//  Getting special price value for customer if exist(else value=0) from db
app.get('/getPrice', async (req, res) => {
    console.log(`Getting price...`);
    const { customerId, itemId } = req.query;
    try {
        const data = await sql.pool
            .request()
            .input('CustomerID', sql.SQLInst.Int, customerId)
            .input('PartID', sql.SQLInst.Int, itemId)
            .query("SELECT * FROM CustomersSpecialPrices WHERE CustomerID=@CustomerID AND PartID=@PartID");
        const specialPrice = await data.recordset;
        const price = {
            value: specialPrice[0]?.Price ? specialPrice[0].Price : 0
        }
        if (price.value === 0) {
            const data2 = await sql.pool
                .request()
                .input('PartID', sql.SQLInst.Int, itemId)
                .query("SELECT * FROM PartsPics WHERE PartID=@PartID");
            const defaultPrice = await data2.recordset;
            if (defaultPrice[0]?.BasePrice)
                price.value = defaultPrice[0].BasePrice;
        }
        res.status(200).send(price);
    } catch (e) {
        console.log("Error occured: ", e)
        res.status(500).send(e);
    }
});

// Route for insert new order
app.post('/insertOrder', async (req, res) => {
    const requestData = req.body;
    console.log("requestData ", requestData)
    try {
        const data = await sql.pool
            .request()
            .input('CustomerId', requestData.customerId)
            .input('CustomerName', requestData.customerName)
            .input('CompID', 1)
            .input('Address', requestData.address)
            .input('City', requestData.city)
            .input('ZipCode', requestData.zipCode)
            .input('Phone', "")
            .input('CustLineID', 0)
            .input('TransDate', new Date(requestData.transDate))
            .input('UserID', requestData.userId)
            .input('UserName', requestData.username)
            .input('compNum', 1)
            .execute('InsertMainOrderFromCust');

        const newOrderId = await data?.recordset[0]?.OrdID;
        console.log("newOrderId", newOrderId);
        if (newOrderId) {
            for (let i = 0; i < requestData.lines.length; i++) {
                await sql.pool
                    .request()
                    .input('CustOrderID', newOrderId)
                    .input('Line', i + 1)
                    .input('PartID', requestData.lines[i].partId)
                    .input('GenerlDes', requestData.lines[i].generalDes)
                    .input('Qunt', requestData.lines[i].qunt)
                    .input('Units', requestData.lines[i].units)
                    .input('kuserID', requestData.lines[i].kuserId)
                    .input('KuserDes', requestData.lines[i].kuserDes)
                    .input('Comment', requestData.lines[i].comment)
                    .input('BasePrice', requestData.lines[i].basePrice)
                    .input('TotalPrice', requestData.lines[i].totalPrice)
                    .input('HashCode', 0)
                    .input('UnitsDes', requestData.lines[i].unitsDes)
                    .input('compNum', 1)
                    .execute('InsertMainOrderFromCustLines');
            }

            res.status(200).send(true);
            return;
        }
        res.status(200).send(false);
    } catch (e) {
        console.log("Error occured: ", e)
        res.status(500).send(false);
    }
});

// Route for insert new order to pending
app.post('/insertPendingOrder', async (req, res) => {

    const requestData = req.body;
    console.log("requestData ", requestData)
    try {
        const data = await sql.pool
            .request()
            .input('CustomerId', requestData.customerId)
            .input('CustomerName', requestData.customerName)
            .input('CompID', 1)
            .input('Address', requestData.address)
            .input('City', requestData.city)
            .input('ZipCode', requestData.zipCode)
            .input('Phone', "")
            .input('CustLineID', 0)
            .input('TransDate', new Date(requestData.transDate))
            .input('UserID', requestData.userId)
            .input('UserName', requestData.username)
            .input('compNum', 1)
            .execute('InsertMainOrderFromCustPending');

        const newOrderId = await data?.recordset[0]?.OrdID;
        console.log("newOrderId", newOrderId);
        if (newOrderId) {
            for (let i = 0; i < requestData.lines.length; i++) {
                await sql.pool
                    .request()
                    .input('CustOrderID', newOrderId)
                    .input('Line', i + 1)
                    .input('PartID', requestData.lines[i].partId)
                    .input('GenerlDes', requestData.lines[i].generalDes)
                    .input('Qunt', requestData.lines[i].qunt)
                    .input('Units', requestData.lines[i].units)
                    .input('kuserID', requestData.lines[i].kuserId)
                    .input('KuserDes', requestData.lines[i].kuserDes)
                    .input('Comment', requestData.lines[i].comment)
                    .input('BasePrice', requestData.lines[i].basePrice)
                    .input('TotalPrice', requestData.lines[i].totalPrice)
                    .input('HashCode', 0)
                    .input('UnitsDes', requestData.lines[i].unitsDes)
                    .input('compNum', 1)
                    .input('BasePriceRequest', requestData.lines[i].basePriceRequest)
                    .execute('InsertMainOrderFromCustLinesPending');
            }

            res.status(200).send(true);
            return;
        }
        res.status(200).send(true);
    } catch (e) {
        console.log("Error occured: ", e)
        res.status(500).send(false);
    }
});
