const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const checkUserExists = users.find(user => user.username === username);

  if (!checkUserExists) {
    return response.status(404).json({
      error: true,
      message: 'User not found',
    });
  }

  request.user = checkUserExists;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const checkUsernameExists = users.find(user =>
    user.username === username,
  );

  if (checkUsernameExists) {
    return response.status(400).json({
      error: true,
      message: 'Username alredy exists!',
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.json(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const userIndex = users.findIndex(user => user.username === request.user.username);

  const todo = {
    id: uuidv4(),
    title,
    deadline,
    done: false,
    created_at: new Date(Date.now()),
  };

  users[userIndex].todos.push(todo);

  return response.status(201).json(todo);  
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;

  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: true,
      message: 'Todo not found.',
    })
  }

  todo.title = title;
  todo.deadline = deadline;
  todo.done = false;

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: true,
      message: 'Todo not found.',
    })
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({
      error: true,
      message: 'Todo not found.',
    });
  };

  user.todos.splice(todoIndex, 1);

  return response.status(204).json();
});

module.exports = app;