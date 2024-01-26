const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const upload = multer();
const app = express();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
const ls = require('local-storage');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');


app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', './views');

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
//form-urlencoded
// for parsing multipart/form-data
app.use(upload.array());
app.use(express.static('public'));

// for using session we havbe to write this 
app.use(session({ secret: "Shh its secret  that we have to use " }));

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "blooddonation"
});


//RENDERING FOR HOME PAGE
app.get('/', function (req, res) {
    let cmd = "SELECT * FROM register";
    con.query(cmd, function (err, result) {
        if (err) throw err;
        else {
            var cookie = req.cookies.jwttoken;
            var len = result.length;
            res.render('index', { 'data': result, 'len': len, 'cookie': cookie });
        }
    });
});


//REGISTER FOR USER
app.get('/register', function (req, res) {
    const mssg = false;
    return res.render("reg", { 'msg': mssg });
});

// RENDERING FOR LOGIN PAGE
app.get('/login', function (req, res) {
    res.render('login');
});

// RENDERING FOR MEMBAR PAGE
app.get('/member', function (req, res) {
    var cookie = req.cookies.jwttoken;
    res.render('membar', { 'cookie': cookie });
});

// RENDERING FOR AFFILIATE ORGANIZATION
app.get('/orgnization', function (req, res) {
    var cookie = req.cookies.jwttoken;
    res.render('org', { 'cookie': cookie });
});

// RENDERING FOR ABOUT
app.get('/about', function (req, res) {
    var cookie = req.cookies.jwttoken;
    res.render('about', { 'cookie': cookie });
});

// RENDERING FOR DASHBOARD
app.get('/dashboard', function (req, res) {
    var cookie = req.cookies.jwttoken;
    if (cookie == null) {
        return res.render('login');
    }
    else {
        const cmd = "SELECT * FROM register WHERE token = '" + cookie + "'";
        con.query(cmd, (err, result, fields) => {
            if (err) {
                throw err;
            }
            else {
                return res.render('dashboard', { 'data': result });
            }
        })
    }
});


//LOGOUT
app.get('/logout', (req, res) => {
    res.clearCookie("jwttoken");
    res.redirect('/');
})

// REGISTRING A USER
app.post('/register', function (req, res) {
    let { userName, userCity, userAddress, userEmail, userMobnumber, userBloodgrp, dobDay, dobMonth, dobYear, gender, userPassword, userConfirmpass } = req.body;
    let userData = 'user';
    let user_id = Date.now();


    //Changing status here
    let cmd = "INSERT INTO register (donor_id,Name,City,Address,Email,Mobnumber,Bloodgrrp,dobDay,dobMonth,dobYear,gender,password1,password2,Status) VALUES ('" + user_id + "','" + userName + "','" + userCity + "','" + userAddress + "','" + userEmail + "','" + userMobnumber + "','" + userBloodgrp + "','" + dobDay + "','" + dobMonth + "','" + dobYear + "','" + gender + "','" + userPassword + "','" + userConfirmpass + "','" + userData + "')";
    con.query(cmd, function (err, result, fields) {
        if (err) {
            const mssg = true;
            return res.render("reg", { 'msg': mssg });
        }
        else {
            return res.render("success");
        }
    });
});


//login for the user
app.post('/login', function (req, res) {
    let { userMobile, userPassword } = req.body;
    let userData = 'user';

    var cmd = "SELECT * FROM register WHERE Mobnumber = '" + userMobile + "' AND password1 ='" + userPassword + "'";
    con.query(cmd, function (err, result, fields) {
        if (err) throw err;
        const Result = result;

        if (result.length > 0) {
            console.log("Hello 1");
            if (Result[0].Status == 'user') {
                console.log("Hello 2");
                let ctoken = jwt.sign({ id: Result[0].donor_id }, "thidfbfjbdsjcdvcbsdujcndsbhcvbdsjcndshcdsjnvcdshjn");
                res.cookie("jwttoken", ctoken);
                let cmd = "UPDATE register SET token = '" + ctoken + "' WHERE donor_id = '" + Result[0].donor_id + "'";
                con.query(cmd, (err, result, fields) => {
                    if (err) throw err;
                    res.render('dashboard', { 'data': Result });
                })
            }
            else {
                let adminName = result[0].Name;
                cmd = "SELECT * FROM register WHERE Status = '" + userData + "' ";
                con.query(cmd, function (err, adminResult, fields) {
                    if (err) throw err;
                    else {
                        res.render('admin', { 'data': adminResult, 'adminN': adminName });
                    }
                })
            }
        }
        else {
            res.render('login_error');
        }
    });
});



// BLOOD DONATION UPDATION
app.get('/bloodDoantion', function (req, res) {
    let dt = new Date();
    let date = dt.getDate();
    let month = dt.getMonth() + 1;
    let year = dt.getFullYear();
    let day = dt.getDay();
    let hour = dt.getHours();
    let minute = dt.getMinutes();
    let x;
    console.log(req.query.phone);

    let cmd = `SELECT * FROM register WHERE Mobnumber=${req.query.phone}`;
    con.query(cmd, (err, result, fields) => {
        if (err) {
            throw err;
        }
        else {
            x = result[0].BLDturn;
            if (x == null) {
                let cmd = `UPDATE register SET BLDdate=${date},BLDmonth=${month},BLDyear=${year},BLDtimehr=${hour},BLDtimemin=${minute},BLDturn=1,BLDpoint=1 WHERE Mobnumber=${req.query.phone}`;
                try {
                    con.query(cmd, (err, result, fields) => {
                        if (err) throw err;
                        else {
                            cmd = `SELECT * FROM register WHERE Mobnumber = ${req.query.phone}`;
                            con.query(cmd, function (err, result, fields) {
                                if (err) throw err;
                                else {
                                    res.render('success1');
                                }
                            });
                        }
                    });
                }
                catch (err) {
                    console.log("Sorry Their is An Error in Updation");
                }
            }
            else {
                x = x + 1;
                let cmd = `UPDATE register SET BLDdate=${date},BLDmonth=${month},BLDyear=${year},BLDtimehr=${hour},BLDtimemin=${minute},BLDturn=${x},BLDpoint=${x} WHERE Mobnumber=${req.query.phone}`;
                try {
                    con.query(cmd, (err, result, fields) => {
                        if (err) throw err;
                        else {
                            cmd = `SELECT * FROM register WHERE Mobnumber = ${req.query.phone}`;
                            con.query(cmd, function (err, result, fields) {
                                if (err) throw err;
                                else {
                                    res.render('success1');
                                }
                            });
                        }
                    });
                }
                catch (err) {
                    console.log("Sorry Their is An Error in Updation");
                }
            }
        }
    })
});



//RECEIVER

app.get('/dashboard/receiver', (req, res) => {
    try {
        var cookie = req.cookies.jwttoken;
        const cmd = "SELECT * FROM register WHERE token = '" + cookie + "'";
        con.query(cmd, (err, result, fields) => {
            if (err) throw err;

            const alertmsg = false;
            const msg = false;
            const data = "nothing";
            ls.set('receiverName', result[0].Name)
            return res.render('receiver', { 'data': result, 'msg': msg, 'alertmsg': alertmsg, 'state_data': data, 'length': 0 });
        })
    }
    catch (err) {
        console.log(err);
    }
})



app.post('/dashboard/receiver/check', (req, res) => {
    const { receiverBldgrp, receiverBldpoint, state } = req.body;
    // console.log(receiverBldgrp, receiverBldpoint, state);

    const cmd = "SELECT COUNT(BLDpoint) AS total_bld_point FROM register WHERE Bloodgrrp = '" + receiverBldgrp + "' AND City = '" + state + "'";
    con.query(cmd, (err, result) => {
        try {
            if (err) {
                const msg = false;
                const alertmsg = true;
                const data = "nothing";

                return res.render('receiver', { 'data': data, 'alertmsg': alertmsg, 'msg': msg, 'state_data': result, 'length': result.length });
            };

            //checking whether the current blood grp is available or not
            let total_bld = Object.values(JSON.parse(JSON.stringify(result)));
            let total_bld_point = total_bld[0].total_bld_point;
            ls.set('receiver_info', {
                'receiverBldgrp': receiverBldgrp,
                'receiverBldpoint': receiverBldpoint,
                'receiverState': state
            })
            // console.log(ls.get('bldPoint'));

            // rendering the page if blood available
            if (total_bld_point >= receiverBldpoint) {
                const msg = true;
                const alertmsg = false;

                // getting all the address of blood bank
                const subcmd = "SELECT * FROM bloodbank WHERE state = '" + state + "'";
                con.query(subcmd, (err, result) => {
                    if (err) throw err;

                    return res.render('receiver', { 'msg': msg, 'alertmsg': alertmsg, 'state_data': result, 'length': result.length });
                })
            }
            else {
                const cookie = req.cookies.jwttoken;
                const cmd = "SELECT * FROM register WHERE token = '" + cookie + "'";
                con.query(cmd, (err, result, fields) => {
                    if (err) throw err;


                    const msg = false;
                    const alertmsg = true;
                    const data = result;

                    return res.render('receiver', { 'data': data, 'alertmsg': alertmsg, 'msg': msg, 'state_data': data, 'length': 0 });
                });
            }

        }
        catch (err) {
            console.log(err);
        }
    })
})


// point to the template folder
const handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve('./views/'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./views/'),
};


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'blooddonationwebsite@gmail.com',
        pass: 'rrnlhtgfilyhhooi'
    }
});


// use a template file with nodemailer
transporter.use('compile', hbs(handlebarOptions));





//RECEIVER GOING TO TAKE BLOOD
app.post('/dashboard/receiver/check/proceed', (req, res) => {
    const { bldPointName } = req.body;
    const cookie = req.cookies.jwttoken;
    const receiver_info = ls.get('receiver_info');

    const cmd = "SELECT * FROM register WHERE token = '" + cookie + "'";
    try {
        con.query(cmd, (err, result) => {

            const receiverName = result[0].Name;
            const receiverEmail = result[0].Email;

            if (err) throw err;

            else {
                const cmd = "SELECT * FROM bloodbank WHERE Name = '" + bldPointName + "'";
                con.query(cmd, (err, result) => {
                    if (err) throw err;

                    else {
                        const bloodbankAddress = result[0].address;
                        const bloodbankState = result[0].state;
                        const bloodbankPincode = result[0].pincode;
                        const id = Date.now();
                        const otp = Math.floor(1000 + Math.random() * 9000);
                        // console.log(receiverEmail);

                        const cmd = "INSERT INTO receiver (receiver_id,receiver_name,receiver_bldgrp,receiver_state,bld_bank_name,bld_bank_address,availed_blood) VALUES ('" + id + "','" + receiverName + "','" + receiver_info.receiverBldgrp + "','" + receiver_info.receiverState + "','" + bldPointName + "','" + bloodbankAddress + "','" + receiver_info.receiverBldpoint + "')";

                        con.query(cmd, (err, result) => {
                            if (err) throw err;

                            else {

                                const mailOptions = {
                                    from: 'Blood Doantion',
                                    to: receiverEmail,
                                    subject: 'Mail From Blood Doantion Website',
                                    template: 'email',
                                    context: {
                                        name: bldPointName,
                                        address: bloodbankAddress,
                                        state: bloodbankState,
                                        pincode: bloodbankPincode,
                                        otp: otp
                                    }
                                };


                                transporter.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        console.log('Email sent: ' + info.response);
                                    }
                                });

                                res.render('success1');
                            }
                        })
                    }
                })
            }
        })
    }
    catch (err) {
        console.log(err);
    }
})


app.listen(3000);