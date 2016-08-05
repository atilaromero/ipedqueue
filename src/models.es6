module.exports = (wagner)=>{
  wagner.factory('materialSchema',(mongoose)=>{
    let schema = new mongoose.Schema({
      item: Number,
      apreensao: String,
      equipe: String,
      path: String
    })
    return schema
  })

  wagner.factory('material',(mongoose,materialSchema)=>{
    let model = mongoose.model('material',materialSchema)
    model.plural('material')
    return model
  })

  wagner.factory('matgroup',(mongoose,materialSchema)=>{
    let schema = new mongoose.Schema({
      ipedoutputpath: String,
      materiais: [materialSchema]
    })
    let model = mongoose.model('matgroup', schema)
    model.plural('matgroup')
    return model
  })
}
