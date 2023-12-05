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
  }).prefix('/personality-traits')

  Route.group(() => {
    Route.get('/', 'RelationshipGoalsController.index')
    Route.get('/:id', 'RelationshipGoalsController.show')
  }).prefix('/relationship-goals')

  Route.group(() => {
    Route.get('/', 'BodyTypesController.index')
    Route.get('/:id', 'BodyTypesController.show')
  }).prefix('/body-types')

  Route.group(() => {
    Route.get('/', 'PoliticalViewsController.index')
    Route.get('/:id', 'PoliticalViewsController.show')
  }).prefix('/political-views')

  Route.group(() => {
    Route.get('/', 'SexesController.index')
    Route.get('/:id', 'SexesController.show')
  }).prefix('/sexes')

  Route.group(() => {
    Route.get('/', 'ReligionsController.index')
    Route.get('/:id', 'ReligionsController.show')
  }).prefix('/religions')

  Route.group(() => {
    Route.post('/', 'UsersController.store')
    Route.put('/', 'UsersController.update')
    Route.get('/:uid', 'UsersController.show')
    Route.delete('/', 'UsersController.destroy')
    Route.get('/', 'UsersController.index')
  })
    .prefix('/users')
    .middleware('auth')

  Route.group(() => {
    Route.post('/', 'PreferencesController.store')
    Route.put('/:id', 'PreferencesController.update')
    Route.get('/:id', 'PreferencesController.show')
  }).prefix('/preferences')

  Route.group(() => {
    Route.post('/', 'SwipesController.store')
    Route.get('/', 'SwipesController.index')
  }).prefix('/swipes')

  Route.group(() => {
    Route.get('/', 'MatchesController.index')
  }).prefix('/matches')
}).prefix('/api')
