import { useState, useEffect } from "react";
import "./movieGuesser.css";

import SearchIcon from "@mui/icons-material/Search";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MovieCreationTwoToneIcon from "@mui/icons-material/MovieCreationTwoTone";

import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { green, yellow } from "@mui/material/colors";
import Typography from "@mui/material/Typography";
import styled from "@emotion/styled";
import { Box as MuiBox } from "@mui/material";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Modal from "@mui/material/Modal";
import Avatar from "@mui/material/Avatar";

function MovieGuesser() {
  const [data, setData] = useState(null);
  const [targetMovie, setTargetMovie] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [guesses, setGuesses] = useState(10);
  const [result, setResult] = useState(null);
  const [correctResult, setCorrectResult] = useState(null);
  const [previousGuesses, setPreviousGuesses] = useState([]);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? "90%" : "60%",
    height: isMobile ? "90%" : "auto",
    bgcolor: "background.paper",
    border: "2px solid #68e36c",
    boxShadow: 24,
    textAlign: "center",
    backgroundImage: "linear-gradient(to right, #ff9966, #ff5e62)",
    animation: "glow 2s ease-in-out infinite alternate",
    overflow: 'auto',
  };

  const Box = styled(MuiBox)({
    backgroundColor: "#3f434a",
    borderRadius: "10px", // rounded borders
    padding: isMobile ? "20px" : "20px",
    margin: isMobile ? "15px" : "10px",
  });

  const NoStyleBox = styled(MuiBox)({
    backgroundColor: "#3f434a",
    borderRadius: "10px", // rounded borders
    padding: isMobile ? "5px" : "5px",
    margin: isMobile ? "5px" : "5px",
  });

  const ModalBox = styled(MuiBox)({
    backgroundColor: "#3f434a",
    borderRadius: "10px", // rounded borders
    padding: isMobile ? "1px" : "20px",
    margin: isMobile ? "5px" : "10px",
  });

  useEffect(() => {
    // change here to run locally or deploy
    fetch("/movile/db.json")
    // fetch("./public/db.json")
      .then((response) => response.json())
      .then((data) => {
        data = data.map((option) => {
          const firstLetter = option.Title[0].toUpperCase();
          return {
            firstLetter: /[0-9]/.test(firstLetter) ? "0-9" : firstLetter,
            ...option,
          };
        });
        setData(data);
        const randomIndex = Math.floor(Math.random() * data.length);
        setTargetMovie(data[randomIndex]);
      })
      .catch((error) => console.error("Error:", error));

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 800);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function convertDurationToMinutes(duration) {
    duration = duration.replace("h", "").replace("min", "");
    const parts = duration.split(" ");
    const hours = parseInt(parts[0]);
    const minutes = parts.length >= 2 ? parseInt(parts[1]) : 0;
    return hours * 60 + minutes;
  }

  async function getMoviePreview(url) {
    const apiKey = "pk_290933a796b51976f98dc3b3b6614fabe7081615";
    const apiUrl = `https://jsonlink.io/api/extract?url=${url}&api_key=${apiKey}`;

    // Make a GET request using the Fetch API
    return fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        return data; // Return the data
      })
      .catch((error) => {
        console.error("An error occurred:", error);
      });
  }

  const resetGame = () => {
    const randomIndex = Math.floor(Math.random() * data.length);
    setTargetMovie(data[randomIndex]);
    setSearchValue("");
    setGuesses(10);
    setResult(null);
    setPreviousGuesses([]);
  };

  const handleGuess = async () => {
    const guessedMovie = data.find((movie) => movie.Title === searchValue);
    if (guessedMovie) {
      if (guessedMovie.Title === targetMovie.Title) {
        setResult(targetMovie.Title);
        setOpen(true);
      } else {
        let result = {};

        result.Title = [guessedMovie.Title];
        const urlData = await getMoviePreview(guessedMovie["IMDB link"]);
        result.imgUrl = urlData.images;

        result.Year = [
          guessedMovie.Year,
          Math.abs(guessedMovie.Year - targetMovie.Year) === 0
            ? "green"
            : Math.abs(guessedMovie.Year - targetMovie.Year) <= 10
            ? "yellow"
            : "red",
          guessedMovie.Year === targetMovie.Year
            ? null
            : guessedMovie.Year > targetMovie.Year
            ? "lower"
            : "higher",
        ];

        result.Genre = [
          guessedMovie.Genre,
          guessedMovie.Genre === targetMovie.Genre
            ? "green"
            : guessedMovie.Genre.split(" | ").some((genre) =>
                targetMovie.Genre.includes(genre)
              )
            ? "yellow"
            : "red",
          null,
        ];

        result.Duration = [
          guessedMovie.Duration,
          (() => {
            const guessedDuration = convertDurationToMinutes(
              guessedMovie.Duration
            );
            const targetDuration = convertDurationToMinutes(
              targetMovie.Duration
            );
            const diff = Math.abs(guessedDuration - targetDuration);
            return diff === 0 ? "green" : diff <= 20 ? "yellow" : "red";
          })(),
          (() => {
            const guessedDuration = convertDurationToMinutes(
              guessedMovie.Duration
            );
            const targetDuration = convertDurationToMinutes(
              targetMovie.Duration
            );
            return guessedDuration === targetDuration
              ? null
              : guessedDuration > targetDuration
              ? "lower"
              : "higher";
          })(),
        ];

        result.Origin = [
          guessedMovie.Origin,
          guessedMovie.Origin === targetMovie.Origin
            ? "green"
            : guessedMovie.Origin.split(" | ").some((origin) =>
                targetMovie.Origin.includes(origin)
              )
            ? "yellow"
            : "red",
          null,
        ];

        result.Director = [
          guessedMovie.Director,
          guessedMovie.Director === targetMovie.Director ? "green" : "red",
          null,
        ];

        result["IMDB rating"] = [
          guessedMovie["IMDB rating"],
          Math.abs(guessedMovie["IMDB rating"] - targetMovie["IMDB rating"]) ===
          0
            ? "green"
            : Math.abs(
                guessedMovie["IMDB rating"] - targetMovie["IMDB rating"]
              ) <= 0.2
            ? "yellow"
            : "red",
          Math.abs(guessedMovie["IMDB rating"] - targetMovie["IMDB rating"]) ===
          0
            ? null
            : guessedMovie["IMDB rating"] - targetMovie["IMDB rating"] > 0
            ? "lower"
            : "higher",
        ];
        setResult(result);
        setPreviousGuesses((prevGuesses) => [...prevGuesses, result]);

        setGuesses(guesses - 1);
      }
      const targetMovieUrlData = await getMoviePreview(
        targetMovie["IMDB link"]
      );
      let correctResult = {
        Title: [targetMovie.Title],
        Year: [targetMovie.Year, "green", null],
        Genre: [targetMovie.Genre, "green", null],
        Duration: [targetMovie.Duration, "green", null],
        Origin: [targetMovie.Origin, "green", null],
        Director: [targetMovie.Director, "green", null],
        "IMDB rating": [targetMovie["IMDB rating"], "green", null],
        imgUrl: targetMovieUrlData.images,
      };
      setCorrectResult(correctResult);
    }
    setSearchValue(""); // clear the text field
  };

  return (
    <div className="main-div">
      {data ? (
        <div
          style={{
            width: "70vh", // take up full viewport width
          }}
        >
          <div
            style={{
              display: "flex",
              height: "20vh",
              margin: "10px",
            }}
          >
            <h1>movile.</h1>
            <Avatar>
              <MovieCreationTwoToneIcon />
            </Avatar>
          </div>
          <Divider
            style={{
              margin: "10px",
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={1}>
              <Grid item xs={9}>
                <Autocomplete
                  options={data.sort(
                    (a, b) => -b.firstLetter.localeCompare(a.firstLetter)
                  )}
                  groupBy={(option) => option.firstLetter}
                  getOptionLabel={(option) => option.Title}
                  value={
                    data.find((movie) => movie.Title === searchValue) || null
                  } // Find the movie object that matches the searchValue
                  onChange={(event, newValue) => {
                    setSearchValue(newValue ? newValue.Title : ""); // If newValue is null, setSearchValue to an empty string
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Guess a movie"
                      variant="filled"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <Button
                  style={{
                    width: "100%",
                    backgroundColor: "#a1bbe3",
                  }}
                  variant="contained"
                  endIcon={<SearchIcon />}
                  onClick={handleGuess}
                >
                  Guess!
                </Button>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                >{`Guesses left: ${guesses}`}</Typography>
              </Grid>
            </Grid>
          </Box>

          {guesses === 0 && (
            <Typography>
              <Modal
                open={true}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <ModalBox sx={modalStyle}>
                  <Typography
                    id="modal-modal-title"
                    variant="h3"
                    component="h2"
                  >
                    Out of guesses...
                  </Typography>
                  <NoStyleBox
                    id="modal-modal-description"
                    sx={{ mt: 2, fontSize: "20px" }}
                  >
                    The correct movie was:
                    <NoStyleBox>
                      <NoStyleBox style={{ display: "flex", alignItems: "center" }}>
                        <h2 style={{ color: "black", marginRight: "20px" }}>
                          {correctResult.Title}
                        </h2>
                        <img
                          src={correctResult.imgUrl}
                          alt="IMDB Image"
                          style={{ maxWidth: "20%", height: "auto" }}
                        />
                      </NoStyleBox>
                      <Grid container spacing={2}>
                        {Object.keys(correctResult).map((key) =>
                          key !== "Title" && key !== "imgUrl" ? (
                            <Grid item xs={6} sm={6} key={key}>
                              <Card
                                sx={{
                                  maxWidth: 400,
                                  backgroundColor:
                                    correctResult[key][1] === "green"
                                      ? green[500]
                                      : correctResult[key][1] === "yellow"
                                      ? yellow[500]
                                      : "#2d2f33",
                                }}
                              >
                                <CardContent
                                  id="movieIndvPropertiesCard"
                                  sx={{
                                    padding: isMobile ? "1px" : "20px",
                                  }}
                                >
                                  <Typography
                                    align="center"
                                    variant={isMobile ? "subtitle1" : "h5"}
                                    style={{ color: "black" }}
                                  >
                                    {`${key}:`}
                                    <br />
                                    {`${correctResult[key][0]}`}
                                    {correctResult[key][2] === "higher" ? (
                                      <ArrowDropUpIcon fontSize="large" />
                                    ) : correctResult[key][2] === "lower" ? (
                                      <ArrowDropDownIcon fontSize="large" />
                                    ) : null}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ) : null
                        )}
                      </Grid>
                    </NoStyleBox>
                    <Button onClick={resetGame}>Play Again</Button>
                  </NoStyleBox>
                </ModalBox>
              </Modal>
            </Typography>
          )}

          {result && typeof result === "string" ? (
            <Typography>
              <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <ModalBox sx={modalStyle}>
                  <Typography
                    id="modal-modal-title"
                    variant="h3"
                    component="h2"
                  >
                    Congratulations!
                  </Typography>
                  <NoStyleBox
                    id="modal-modal-description"
                    sx={{ mt: 2, fontSize: "20px" }}
                  >
                    The correct movie was:
                    <NoStyleBox>
                      <NoStyleBox style={{ display: "flex", alignItems: "center" }}>
                        <h2 style={{ color: "black", marginRight: "20px" }}>
                          {correctResult.Title}
                        </h2>
                        <img
                          src={correctResult.imgUrl}
                          alt="IMDB Image"
                          style={{ maxWidth: "20%", height: "auto" }}
                        />
                      </NoStyleBox>
                      <Grid container spacing={2}>
                        {Object.keys(correctResult).map((key) =>
                          key !== "Title" && key !== "imgUrl" ? (
                            <Grid item xs={6} sm={6} key={key}>
                              <Card
                                sx={{
                                  maxWidth: 400,
                                  backgroundColor:
                                    correctResult[key][1] === "green"
                                      ? green[500]
                                      : correctResult[key][1] === "yellow"
                                      ? yellow[500]
                                      : "#2d2f33",
                                }}
                              >
                                <CardContent
                                  id="movieIndvPropertiesCard"
                                  sx={{
                                    padding: isMobile ? "1px" : "20px",
                                  }}
                                >
                                  <Typography
                                    align="center"
                                    variant={isMobile ? "subtitle1" : "h5"}
                                    style={{ color: "black" }}
                                  >
                                    {`${key}:`}
                                    <br />
                                    {`${correctResult[key][0]}`}
                                    {correctResult[key][2] === "higher" ? (
                                      <ArrowDropUpIcon fontSize="large" />
                                    ) : correctResult[key][2] === "lower" ? (
                                      <ArrowDropDownIcon fontSize="large" />
                                    ) : null}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ) : null
                        )}
                      </Grid>
                    </NoStyleBox>
                    <Button onClick={resetGame}>Play Again</Button>
                  </NoStyleBox>
                </ModalBox>
              </Modal>
            </Typography>
          ) : (
            result && (
              <Box>
                <NoStyleBox style={{ display: "flex", alignItems: "center" }}>
                  <h2 style={{ color: "black", marginRight: "20px" }}>
                    {result.Title}
                  </h2>
                  <img
                    src={result.imgUrl}
                    alt="IMDB Image"
                    style={{ maxWidth: "20%", height: "auto" }}
                  />
                </NoStyleBox>
                <Grid container spacing={2}>
                  {Object.keys(result).map((key) =>
                    key !== "Title" && key !== "imgUrl" ? (
                      <Grid item xs={6} sm={6} key={key}>
                        <Card
                          sx={{
                            maxWidth: 400,
                            backgroundColor:
                              result[key][1] === "green"
                                ? green[500]
                                : result[key][1] === "yellow"
                                ? yellow[500]
                                : "#2d2f33",
                          }}
                        >
                          <CardContent
                            id="movieIndvPropertiesCard"
                            sx={{
                              padding: isMobile ? "1px" : "20px",
                            }}
                          >
                            <Typography
                              align="center"
                              variant={isMobile ? "h6" : "h5"}
                              style={{ color: "black" }}
                            >
                              {`${key}:`}
                              <br />
                              {`${result[key][0]}`}
                              {result[key][2] === "higher" ? (
                                <ArrowDropUpIcon fontSize="large" />
                              ) : result[key][2] === "lower" ? (
                                <ArrowDropDownIcon fontSize="large" />
                              ) : null}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ) : null
                  )}
                </Grid>
              </Box>
            )
          )}
          {previousGuesses
            .slice(0, -1)
            .reverse()
            .map((guess, index) => (
              <Box key={index}>
                <NoStyleBox style={{ display: "flex", alignItems: "center" }}>
                  <h2 style={{ color: "black", marginRight: "20px" }}>
                    {guess.Title}
                  </h2>
                  <img
                    src={guess.imgUrl}
                    alt="IMDB Image"
                    style={{ maxWidth: "20%", height: "auto" }}
                  />
                </NoStyleBox>
                <Grid container spacing={2}>
                  {Object.keys(guess).map((key) =>
                    key !== "Title" && key !== "imgUrl" ? (
                      <Grid item xs={6} sm={6} key={key}>
                        <Card
                          sx={{
                            maxWidth: 400,
                            backgroundColor:
                              guess[key][1] === "green"
                                ? green[500]
                                : guess[key][1] === "yellow"
                                ? yellow[500]
                                : "#2d2f33",
                          }}
                        >
                          <CardContent
                            id="movieIndvPropertiesCard"
                            sx={{
                              padding: isMobile ? "1px" : "20px",
                            }}
                          >
                            <Typography
                              align="center"
                              variant={isMobile ? "h6" : "h5"}
                              style={{ color: "black" }}
                            >
                              {`${key}:`}
                              <br />
                              {`${guess[key][0]}`}
                              {guess[key][2] === "higher" ? (
                                <ArrowDropUpIcon fontSize="large" />
                              ) : guess[key][2] === "lower" ? (
                                <ArrowDropDownIcon fontSize="large" />
                              ) : null}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ) : null
                  )}
                </Grid>
              </Box>
            ))}
          <Box
            style={{
              border: "5px solid #735231",
            }}
          >
            {/*  */}
            <Grid container spacing={2}>
              <Grid item xs={6} sm={6}>
                <Card
                  sx={{
                    maxWidth: 400,
                    minHeight: 70,
                    backgroundColor: green[500],
                  }}
                >
                  <CardContent
                    id="movieIndvPropertiesCard"
                    sx={{
                      padding: isMobile ? "1px" : "20px",
                    }}
                  >
                    <Typography
                      align="center"
                      variant={isMobile ? "h6" : "h5"}
                      style={{ color: "black" }}
                    >
                      Correct
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6}>
                <Card
                  sx={{
                    maxWidth: 400,
                    minHeight: 70,
                    backgroundColor: yellow[500],
                  }}
                >
                  <CardContent
                    id="movieIndvPropertiesCard"
                    sx={{
                      padding: isMobile ? "1px" : "20px",
                    }}
                  >
                    <Typography
                      align="center"
                      variant={isMobile ? "h6" : "h5"}
                      style={{ color: "black" }}
                    >
                      Close or one is correct
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6}>
                <Card
                  sx={{
                    maxWidth: 400,
                    minHeight: 70,
                    backgroundColor: "#2d2f33",
                  }}
                >
                  <CardContent
                    id="movieIndvPropertiesCard"
                    sx={{
                      padding: isMobile ? "1px" : "20px",
                    }}
                  >
                    <Typography
                      align="center"
                      variant={isMobile ? "h6" : "h5"}
                      style={{ color: "black" }}
                    >
                      Wrong
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/*  */}
          </Box>
        </div>
      ) : (
        "Loading..."
      )}
    </div>
  );
}

export default MovieGuesser;
