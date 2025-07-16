import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  withCredentials: true,
});

export const fetchSongsByDate = date =>
  api.get("/records/songs", { params: { date } });

export const toggleSaveSong = ({ videoId, date }) =>
  api.post("/records/songs", { videoId, date });

export const deleteSavedSong = id =>
  api.delete(`/api/saved-songs/${id}`);

export const fetchSavedSongs = (userId, date) =>
  api.get("/api/saved-songs", { params: { userId, date } });

export const saveSong = (userId, date, song) =>
  api.post("/api/saved-songs", { userId, date, song });