/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    Route.get('/', 'CharactersController.index')
    Route.get('/:uuid', 'CharactersController.show')
  }).prefix('/characters')

  Route.group(() => {
    Route.post('/', 'FeedbacksController.store')
    Route.get('/', 'FeedbacksController.index')
    Route.get('/:id', 'FeedbacksController.show')
  }).prefix('/feedbacks')

  Route.group(() => {
    Route.get('/', 'HobbiesController.index')
    Route.get('/:id', 'HobbiesController.show')
  }).prefix('/hobbies')

  Route.group(() => {
    Route.get('/', 'PersonalityTraitsController.index')
    Route.get('/:id', 'PersonalityTraitsController.show')
  }).prefix('/traits')

  Route.group(() => {
    Route.get('/', 'RelationshipGoalsController.index')
    Route.get('/:id', 'RelationshipGoalsController.show')
  }).prefix('/relationship-goals')

  Route.group(() => {
    Route.get('/', 'BodyTypesController.index')
    Route.get('/:id', 'BodyTypesController.show')
  }).prefix('/bodytypes')
}).prefix('/api')
