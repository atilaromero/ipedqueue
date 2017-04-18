module.exports = {
  state: {
    type: String,
    enum: ['hold', 'todo', 'running', 'done', 'failed'],
    default: 'hold'
  },
  stage: String,
  run_at: String,
  nice: {type: Number, default: 0},
  progress: String,
  obs: String
}
