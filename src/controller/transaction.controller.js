const { default: mongoose } = require("mongoose");
const accountModel = require("../models/accounts.model");
const transactionModel = require("../models/transaction.model");
const emailService = require("../services/email.service");
const ledgerModel = require("../models/ledger.model");
const userModel = require("../models/user.model");

async function createtransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "all feilds are required",
    });
  }

  const fromUserAccount = await accountModel.findById(fromAccount);
  const toUserAccount = await accountModel.findById(toAccount);

  const userId=req.user.id
  console.log(userId)

  const userAccount=await accountModel.findOne({
    user:userId
  })
  console.log(userAccount)

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "to or from Account does not exists",
    });
  }
  // to check if a transaction has already been done or not with same idempotency key

  const istransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey,
  });

  console.log(istransactionAlreadyExists)

  if (istransactionAlreadyExists) {
    if (istransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "transaction completed",
        transaction: istransactionAlreadyExists,
      });
    }

    if (istransactionAlreadyExists.status == "PENDING") {
      return res.status(200).json({
        message: "transaction is still processing",
      });
    }

    if (istransactionAlreadyExists.status == "FAILED") {
      return res.status(500).json({
        message: "transaction process failed plz try again",
      });
    }

    if (istransactionAlreadyExists.status == "REVERSED") {
      return res.status(200).json({
        message: "transaction reversed",
      });
    }
  }

if(istransactionAlreadyExists){
  return re.status(400).json({
    message:'transcation already exists'
  })
}

  //check if to or from account is Active or Not
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message:
        "fromAccount and ToAccount must be active to perform a transaction",
    });
  }

  // Derive Sender balance from ledger

  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(409).json({
      message: `your balance is ${balance} but you are requesting ${amount} which is insufficent`,
    });
  }

  // create transaction(PENDING)
try{
  const session = await mongoose.startSession();

  session.startTransaction();

  const transaction = (await transactionModel.create(
    [
      {
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING",
      },
    ],
    { session },)
  )[0];

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
      },
    ],
    { session },
  );

  
  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
      },
    ],
    { session },
  );

  await transactionModel.findOneAndUpdate(
    { _id: transaction._id },
    { status: "COMPLETED" },
    { session },
  );
transaction.status="COMPLETED"
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();
}catch(err){
  console.log(err)
  return res.status(400).json({
    message:"trenscation failed"
    
  })
}
  if (transaction.status !== "COMPLETED") {
    await emailService.sendTransactionFaliureEmail(
      req.user.email,
      req.user.name,
      amount,
      toAccount,
    );

    return res.status(400).json({
      message: "transaction Not completed ",
    });
  }

  await emailService.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toAccount,
  );
  res.status(200).json({
    message: "transaction completed successfully",
  });
}

async function createInitialFundstransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "all fields are requird!!!",
    });
  }

  const toUserAccount = await accountModel.findById(toAccount);

  if (!toUserAccount) {
    return res.status(400).json({
      message: "no user exists with this Account",
    });
  }

  const fromUserAccount = await userModel.findOne({
    systemUser: true,
  });

  if (!fromUserAccount) {
    return res.status(404).json({
      message: "no account exists",
    });
  }

  try{
  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction =( await transactionModel.create(
    [
      {
        fromAccount: fromUserAccount._id,
        toAccount: toUserAccount._id,
        idempotencyKey,
        amount,
        status: "PENDING",
      },
    ],
    { session },
  ))[0];

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "DEBIT",
      },
    ],
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "CREDIT",
      },
    ],
    { session },
  );

  await transactionModel.findOneAndUpdate(
    { _id: transaction._id },
    { status: "COMPLETED" },
    { session },
  );
transaction.status="COMPLETED"
  await transaction.save({ session });
  await session.commitTransaction();

  session.endSession();
}catch(err){
  return res.status(400).json({
    message:"initial fund transaction failed"
  })
}

  res.status(201).json({
    message: "initial fund transaction completed successfully",
    transaction: transaction,
  });
}

module.exports = { createtransaction, createInitialFundstransaction };
