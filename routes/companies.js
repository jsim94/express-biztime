const Router = require("express").Router;
const ExpressError = require("../expressError");
const db = require("../db");

const router = new Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT code, name FROM companies");
    return res.json({ companies: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const code = req.params.code;
    const company = await db.query(
      `SELECT code, name, description
       FROM companies
       WHERE code = $1`,
      [code]
    );

    const invoices = await db.query(
      `SELECT id 
       FROM invoices
       WHERE comp_code = $1`,
      [code]
    );

    if (company.rows.length === 0) throw new ExpressError(`Company with code ${code} not found.`, 404);

    const data = company.rows[0];
    const jsonResult = {
      company: {
        code: data.code,
        name: data.name,
        description: data.description,
        invoices: invoices.rows.map((inv) => inv.id),
      },
    };

    return res.json(jsonResult);
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const result = await db.query(
      `INSERT INTO companies (code, name, description) 
       VALUES ($1, $2, $3) 
       RETURNING code, name, description`,
      [code, name, description]
    );

    return res.json({ company: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const code = req.params.code;
    const { name, description } = req.body;
    const result = await db.query(
      `UPDATE companies
       SET name=$1, description=$2
       WHERE code = $3
       RETURNING code, name, description`,
      [name, description, code]
    );

    if (result.rows.length === 0) throw new ExpressError(`Company with code ${code} not found.`, 404);

    return res.json({ company: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const code = req.params.code;
    const result = await db.query(
      `DELETE FROM companies
       WHERE code=$1
       RETURNING code`,
      [code]
    );

    if (result.rows.length === 0) throw new ExpressError(`Company with code ${code} not found.`, 404);

    return res.json({ status: "deleted" });
  } catch (e) {
    console.log(e);
    return next(e);
  }
});

module.exports = router;
