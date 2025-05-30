import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "World",
  password: "Wanna0101",
  port: 5432,
})

db.connect();



const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// app.get("/", async (req, res) => {
//   //Write your code here.
// });

async function check_visited() {
  const result = await db.query("SELECT country_code FROM visited_countries");
  // console.log(result);
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);

  });
  // console.log(result.rows);
  return countries;
}


app.get("/", async (req, res) => {
  // const result = await db.query("SELECT country_code FROM visited_countries");
  // // console.log(result);
  // let countries = [];
  // result.rows.forEach((country) => {
  //   countries.push(country.country_code);

  // });
  const countries = await check_visited();
  // console.log(result.rows);
  res.render("index.ejs", {
    countries: countries, total: countries.length
  });
  // db.end();
}
);

app.post("/add", async (req, res) => {
  const input = req.body["country"];
  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE  '%' || $1 || '%';",
      [input.toLowerCase()]
    );
    // ^ this is to check the SQL lowercase query with the input that's changed to lowercase;
    // const input = req.body["country"];
    // const result = await db.query("SELECT country_code FROM countries WHERE country_name = $1", [input]);
    // console.log(result.rows);
    // if (result.rows.length !== 0)
    const data = result.rows[0];
    // console.log(data);
    const countryCode = data.country_code;
    try {
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
      );
      res.redirect("/");

    } catch (err) {
      const countries = await check_visited();
      res.render("index.ejs", {
        countries: countries, total: countries.length, error: "You have already visited this country, try again"
      })
    }
    // res.redirect("/");
  } catch (err) {
    // console.log(err);
    const countries = await check_visited();
    res.render("index.ejs", {
      countries: countries, total: countries.length, error: "Country name doesn't exist, try again"
    });
  }

  // db.end();
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});