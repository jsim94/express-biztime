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
    const { amt } = req.body;
    const result = await db.query(
      `UPDATE invoices
       SET amt = $1
       WHERE id = $2
       RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, id]
    );

    if (result.rows.length === 0) throw new ExpressError(`Invoice with id ${id} not found.`, 404);

    return res.json({ invoice: result.rows });
  } catch (e) {
    console.log(e.stack);
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

    if (result.rows.length === 0) throw new ExpressError(`Invoice with code ${id} not found.`, 404);

    return res.json({ status: "deleted" });
  } catch (e) {
    console.log(e);
    return next(e);
  }
});

module.exports = router;
