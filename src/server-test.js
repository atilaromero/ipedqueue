'use strict';

describe('server',function () {
  var decache = require('decache')
  var clearRequire = require('clear-require');
  var request = require('request')
  let server;
  let baseUrl;
  beforeAll(function () {
    this.wagner = require('wagner-core');
    this.wagner.factory('config',function () {
      return require('../config-test.json')
    });
    require('./mongoose')(this.wagner);
    require('./models')(this.wagner);
    require('./kue')(this.wagner);
    require('./queue')(this.wagner);
    require('./app')(this.wagner);
    this.wagner.invoke(function (config,app) {
      server = app.listen(config.listenport)
      baseUrl = 'http://localhost:'+config.listenport
    });
  });
  afterAll(function (){
    this.wagner.clear();
    decache('./app');
    decache('./queue');
    decache('./kue');
    decache('kue');
    decache('./models');
    decache('./mongoose');
    decache('wagner-core');
    console.log('require.cache',Object.keys(require.cache))
  });

  describe("config",function (){
    it("exists",function (done){
      this.wagner.invoke(function (config) {
        expect(config).not.toBeUndefined();
        expect(config).not.toBeNull();
        expect(config.listenport).toBe(8880);
        done();
      });
    });
  });
  describe("material",function (){
    it('count',function (done){
      this.wagner.invoke(function (material) {
        material.count(function (err,data){
          expect(err).toBeNull();
          expect(data).toBe(0);
          done();
        });
      });
    });
    it("save",function (done){
      this.wagner.invoke(function (material) {
        let m1 = new material({
          _id: 161234,
          path: "Z:\\operacoes\\operacao_teste\\auto_apreensao_teste\\item02-M161234_001372995DDD5B941B13000C\\item02-M161234_001372995DDD5B941B13000C.dd"
        });
        m1.save(function (err){
          expect(err).toBeNull();
          done();
        });
      });
    });
    it('count',function (done){
      this.wagner.invoke(function (material) {
        material.count(function (err,data){
          expect(err).toBeNull();
          expect(data).toBe(1);
          done();
        });
      });
    });
    it('getone',function (done){
      this.wagner.invoke(function (material) {
        material.findOne(function (err,data){
          expect(err).toBeNull();
          expect(data._id).toBe(161234);
          done();
        });
      });
    });
  });
  describe("matgroup",function (){
    it("new",function (done){
      this.wagner.invoke(function (matgroup) {
        let test = new matgroup({
          ipedoutputpath: "Z:\\operacoes\\operacao_teste\\auto_apreensao_teste\\SARD_Midias",
          status: "notready",
          materiais: [161234]
        });
        test.save(function (err){
          expect(err).toBeNull();
          done();
        });
      });
    });
  });
  describe("queue",function (){
    it('count',function (done){
      request.get(baseUrl+'/queue/jobs/0..-1',(err,res,body)=>{
        expect(err).toBeNull();
        let json = JSON.parse(body);
        expect(json.length).toBe(0);
        done();
      });
    });
    it('update matgroup status',function (done){
      this.wagner.invoke(function (matgroup) {
        matgroup.findOne(function (err,data){
          expect(err).toBeNull();
          data.status = 'ready';
          data.save((err,data)=>{
            expect(err).toBeNull();
            expect(data.status).toBe('ready');
            done();
          });
        });
      });
    });
    it('count',function (done){
      request.get(baseUrl+'/queue/jobs/0..-1',(err,res,body)=>{
        expect(err).toBeNull();
        let json = JSON.parse(body);
        expect(json.length).toBe(1);
        done();
      });
    });
    it('stats',function (done){
      request.get(baseUrl+'/queue/stats',(err,res,body)=>{
        expect(err).toBeNull();
        let json = JSON.parse(body);
        expect(json.completeCount).toBe(0);
        expect(json.activeCount).toBe(1);
        expect(json.delayedCount).toBe(0);
        done();
      });
    });
    it('wait',function (done){
      setTimeout(function () {
        done();
      }, 2000);
    });
    it('stats',function (done){
      request.get(baseUrl+'/queue/stats',(err,res,body)=>{
        expect(err).toBeNull();
        let json = JSON.parse(body);
        expect(json.completeCount).toBe(0);
        expect(json.activeCount).toBe(0);
        expect(json.delayedCount).toBe(0);
        done();
      });
    });
    let lastjobid = null
    it('find last',function(done){
      request.get(baseUrl+'/queue/jobs/0..-1',(err,res,body)=>{
        expect(err).toBeNull();
        let json = JSON.parse(body);
        lastjobid = json.pop().id;
        done();
      });
    });
    it('log',function (done){
      request.get(baseUrl+'/queue/job/'+lastjobid+'/log',(err,res,body)=>{
        expect(err).toBeNull();
        done();
      });
    });
  });
  describe("cleaning",function (){
    it('material',function(done){
      this.wagner.invoke(function (material) {
        material.findOne(161234).remove((err)=>{
          expect(err).toBeNull();
          done();
        });
      });
    });
    it('material - count',function (done){
      this.wagner.invoke(function (material) {
        material.count((err,data)=>{
          expect(err).toBeNull();
          expect(data).toBe(0);
          done();
        });
      })
    });
    it('matgroup',function (done){
      this.wagner.invoke(function (matgroup) {
        matgroup.findOne({materiais: [161234]}).remove((err)=>{
          expect(err).toBeNull();
          done();
        });
      });
    });
    it('matgroup - count', function (done){
      this.wagner.invoke(function (matgroup) {
        matgroup.count((err,data)=>{
          expect(err).toBeNull();
          expect(data).toBe(0);
          done();
        });
      });
    });
    it('job',function (done){
      request.get(baseUrl+'/queue/jobs/0..-1',(err,res,body)=>{
        expect(err).toBeNull();
        let json = JSON.parse(body);
        if (json.length>0){
          request.delete(baseUrl+'/queue/job/'+json.pop().id,(err,res,body)=>{
            expect(err).toBeNull();
            let json = JSON.parse(body);
            expect(json.error).toBeUndefined();
            done();
          })
        }else{
          done();
        }
      });
    });
    it("server", function (done) {
      server.close();
      done();
    });
    it("mongoose", function (done) {
      this.wagner.invoke(function (mongoose) {
        mongoose.connection.close();
        delete mongoose.models.matgroup;
        delete mongoose.models.material;
        done();
      })
    });
  });
});
