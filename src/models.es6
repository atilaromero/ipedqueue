module.exports = (wagner)=>{
  wagner.factory('materialSchema',(mongoose)=>{
    let schema = new mongoose.Schema({
      item: Number,
      apreensao: String,
      equipe: String,
      path: String
    })

    schema.post('save',(doc)=>{
      console.log('saved',doc._id)
    })
    return schema
  })

  wagner.factory('apreensao',(mongoose,materialSchema)=>{
    let schema = new mongoose.Schema({
      path: String,
      materiais: [materialSchema]
    })
    schema.post('save',(doc)=>{
      console.log('saved',doc._id)
    })
    let model = mongoose.model('apreensao', schema)
    model.plural('apreensao')
    return model
  })
}
