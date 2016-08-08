module.exports = (wagner)=>{
  wagner.factory('materialSchema',(mongoose)=>{
    let schema = new mongoose.Schema({
      _id: Number,
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

  wagner.factory('matgroup',(mongoose,materialSchema,queue)=>{
    let schema = new mongoose.Schema({
      ipedoutputpath: String,
      status: {type: String, default: 'notready'},
      materiais: [{type: Number, ref:'material'}]
    })
    let model = mongoose.model('matgroup', schema)
    model.plural('matgroup')
    schema.post('save',doc=>{
      if (doc.status && doc.status==='ready'){
        model.populate(doc,{path: 'materiais'},(err,doc2)=>{
          queue.create('iped', doc2).save()
        })
      }
    })
    return model
  })
}
