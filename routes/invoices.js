const Router = require("express").Router;
const ExpressError = require("../expressError");
const db = require("../db");

const router = new Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT id, comp_code FROM invoices");
    return res.json({ invoices: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await db.query(
      `SELECT i.id, amt, i.paid, i.add_date, i.paid_date, c.code, c.name, c.description
       FROM invoices as i
        JOIN companies as c ON (i.comp_code = c.code)
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) throw new ExpressError(`Invoice with id ${id} not found.`, 404);

    const data = result.rows[0];
    const jsonResult = {
      invoice: {
        id: data.id,
        amt: data.amt,
        paid: data.paid,
        add_date: data.add_date,
        paid_date: data.paid_date,
        company: {
          code: data.code,
          name: data.name,
          description: data.description,
        },
      },
    };

    return res.json(jsonResult);
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt) 
       VALUES ($1, $2) 
       RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );

    return res.json({ invoice: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    let { amt, paid } = req.body;

    const search = await db.query(
      `SELECT *
       FROM invoices
       WHERE id = $1`,
      [id]
    );
    const invoice = search.rows[0];
    if (!invoice) throw new ExpressError(`Invoice with code ${id} not found.`, 404);

    let toPay = invoice.paid;
    let paidDate = invoice.paid_date;

    if (amt === undefined) amt = invoice.amt;

    if (paid !== undefined) {
      if (paid && !toPay) {
        toPay = true;
        paidDate = new Date();
      } else if (!paid && invoice.paid) {
        toPay = false;
        paidDate = null;
      }
    }
    const result = await db.query(
      `UPDATE invoices
       SET amt = $1, paid = $2, paid_date = $3
       WHERE id = $4
       RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, toPay, paidDate, id]
    );

    return res.json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await db.query(
      `DELETE FROM invoices
       WHERE id=$1
       RETURNING id`,
      [id]
    );

    return res.json({ status: "deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
