const path = require('path');
const express = require('express'),
  app = express(),
  http = require('http');
  port = process.env.PORT || 3000;

const fileSystem = require("fs");
const fetch = require("node-fetch");

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded());

const getGCD = (num1, num2) => {
  num1 = Math.abs(num1);
  num2 = Math.abs(num2);

  let previousNum = num2;
  while(true)
  {
    if(num2 === num2)
    {
      previousNum = num2;
      num2 = num1 % num2;
      num1 = previousNum;

      if(num2 % num1 === 0)
      {
        break;
      }
    }
    else
    {
      break;
    }
  }

  return num1;
}

const getLCM = (num1, num2) => {
  return Math.abs((num1 * num2)) / (getGCD(num1, num2));
}

const findPrims = (minCalcNum, maxCalcNum, amount) => {
  let iterations = 0;

  while(iterations < amount)
  {
    let foundPrim = true;
    let num = Math.floor(Math.random() * maxCalcNum) + minCalcNum;

    for(let i = 2; i < num; i++)
    {
      if (num % i === 0) foundPrim = false;
    }

    if(foundPrim === false)
    {
      findPrims();
    }
    else
    {
      primValuesArray.push(num);
      iterations += 1;
    }
  }
}

const getEquationVars = () => {
  const vars = new Array();

  if(primValuesArray.length > 0)
  {
    vars.push(getGCD(primValuesArray[0] - 1, primValuesArray[1] - 1),
              primValuesArray[0],
              primValuesArray[1],
              primValuesArray[0] * primValuesArray[1],
              getLCM(primValuesArray[0] - 1, primValuesArray[1] - 1)
             );

    primValuesArray = [];
  }

  return vars;
}

const isDivisable = (E, totient) => {
  while(totient % E !== 1)
  {
    E++;
  }

  return E;
}

const calcModInverse = (E, LCM) => {
    E %= LCM;
    for (var iterations = 1; iterations <= LCM; iterations++) 
    {
        /*
        if ((E * iterations) % LCM === 1) 
        {
            return iterations;
        }
        */
        iterations = (E * iterations) % LCM;

        if(iterations === 0) 
        {
          primeE = E = isDivisable(primeE + 1, totient_carmichael);
          console.log("Yes :: " + E);
        }
        else 
        {
          return iterations;
        }
    }
}

const manageKeyData = (indata, encrypt) => {
  if(typeof(encrypt) === 'boolean')  
  {
    if(encrypt) 
    {
      let outdata = new Array();

      for(let pos = 0; pos < indata.length; pos++) 
      {
        outdata.push(indata.charCodeAt(pos));
      }

      return outdata;
    }
    else 
    {
      let outdata = "";

      for(let i = 0; i < indata.length; i++) 
      {
        outdata += String.fromCharCode(indata[i]);
      }

      return outdata; 
    }
  }
  else 
  {
    console.log("Get your datatypes right!");
  }
}

const encryptKey = (msg, totient_n, E) => {

  let key = 1;
  for(let i = 1; i <= E; i++)
  { 
    key = (key * msg) % totient_n; 
  }

  return key;
}

const decryptKey = (key, totient_n, D) => {

  let keyLoop = 1;
  for(let i = 1; i <= D; i++)
  {  
    keyLoop = (keyLoop * key) % totient_n;
  }
  
  return manageKeyData(key, false);
}

/*
const generateKeys = (request, response) => {

}
*/

let primValuesArray = new Array();
let keyEncrypted, keyDecrypted;

findPrims(3, 7919, 2);

const vars = getEquationVars();

const gcd = vars[0];

const num1 = vars[1];
const num2 = vars[2];

const positive_n_carmichael = vars[3];
const totient_carmichael = vars[4];

let primeE = isDivisable(3, totient_carmichael);
const modInverse = calcModInverse(primeE, totient_carmichael)

console.log("\nGCD :: " + gcd + "\n")

console.log("NUM1 :: " + num1);
console.log("NUM2 :: " + num2 + "\n");

console.log("POSITIVE_N_CARMICHAEL :: " + positive_n_carmichael);
console.log("E VALUE FOR TOTIENT_CARMICHAEL :: " + primeE);
console.log("E - GCD OF TOTIENT_CARMICHAEL :: " + getGCD(primeE, totient_carmichael));
console.log("D == " + modInverse);
console.log("TOTIENT_CARMICHAEL :: " + totient_carmichael + "\n");

const data = manageKeyData("hello world!", true);
const datastr = data.join('');

keyEncrypted = encryptKey(datastr, positive_n_carmichael, primeE);
keyDecrypted = decryptKey(keyEncrypted, positive_n_carmichael, modInverse);

console.log("ENCRYPTED :: " + keyEncrypted);
console.log("DECRYPTED :: " + keyDecrypted + "\n");

console.log("ASCII MSG ENCODED :: " + datastr);
console.log("ASCII MSG DECODED :: " + manageKeyData(data, false) + "\n");

// console.log(String.fromCharCode(49)); <-- returns number 1
// console.log("1".charCodeAt(0)); <-- returns charcode 49

let errorArray = new Array();
let errorValues = new Array();

let checkKeys = (data) => {
  for (let [key, value] of Object.entries(data))
  {
    if(value == "" || data["login"] != "true")
    {
      data[key] = "null";
      errorArray.push(key);
      errorValues.push(data[key]);
    }
  }

  if(errorArray.length > 0)
  {
    return { error: true, emptyKey: errorArray, value: errorValues };
  }

  return true;
}

fetch("http://" + "127.0.0.1" + ":" + port + "/login",
{
  method : "POST",
  headers : {
    "Content-Type" : "application/json"
  },
  body : JSON.stringify({
    user:
    {
      username: "",
      password: "",
      login: ""
    }
  })
}).then(() => {
  app.use(express.json());

  app.post("/login", function(request, response)
  {
    var dataBody = request.body.user;
    let keyscheck = checkKeys(dataBody);

    if(keyscheck == true)
    {
      const username = dataBody.username;
      const password = dataBody.password;
      const loginBool = dataBody.login;

      console.log("================================")
      console.log("LOGIN ATTEMPT!\n");

      if(loginBool === "true")
      {
        console.log("username :: " + username);
        console.log("password :: " + password);
        console.log("login :: " + loginBool);
      }
      console.log("================================")
    }
    else
    {
      console.log("");
      response.json(keyscheck)
      console.log(keyscheck);
      console.log("");
    }

    errorArray = [];
    errorValues = [];
  });
});

app.listen = function () {
  var server = http.createServer(this);
  return server.listen.apply(server, arguments);
}

var server = http.createServer(app).listen(port)
console.log("Server started on port :: " + port);
