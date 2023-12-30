// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { randomBytes } = require('crypto');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  const postComments = commentsByPostId[req.params.id] || [];
  res.send(postComments);
});

app.post('/posts/:id/comments', (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { id } = req.params;
  const { content } = req.body;

  const comments = commentsByPostId[id] || [];
  comments.push({ id: commentId, content, status: 'pending' });

  commentsByPostId[id] = comments;

  res.status(201).send(comments);
});

app.listen(4001, () => {
  console.log('Listening on 4001');
});

// Path: events-bus.js
// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(bodyParser.json());

app.post('/events', (req, res) => {
  const event = req.body;

  axios.post('http://localhost:4000/events', event); // posts
  axios.post('http://localhost:4001/events', event); // comments
  axios.post('http://localhost:4002/events', event); // query
  axios.post('http://localhost:4003/events', event); // moderation

  res.send({ status: 'OK' });
});

app.listen(4005, () => {
  console.log('Listening on 4005');
});

// Path: moderation.js
// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(bodyParser.json());

app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  if (type === 'CommentCreated') {
    const status = data.content.includes('orange') ? 'rejected' : 'approved';
    await axios.post('http://localhost:4005/events', {
      type: 'CommentModerated',
      data: { ...data, status },
    });