DROP TABLE IF EXISTS invoices;

DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
  code text PRIMARY KEY,
  NAME text NOT NULL UNIQUE,
  description text
);

CREATE TABLE invoices (
  id serial PRIMARY KEY,
  comp_code text NOT NULL REFERENCES companies ON
  DELETE CASCADE,
    amt FLOAT NOT NULL,
    paid BOOLEAN DEFAULT FALSE NOT NULL,
    add_date DATE DEFAULT CURRENT_DATE NOT NULL,
    paid_date DATE,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::DOUBLE PRECISION))
);

INSERT INTO companies
VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
  ('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
VALUES ('apple', 100, FALSE, NULL),
  ('apple', 200, FALSE, NULL),
  ('apple', 300, TRUE, '2018-01-01'),
  ('ibm', 400, FALSE, NULL);