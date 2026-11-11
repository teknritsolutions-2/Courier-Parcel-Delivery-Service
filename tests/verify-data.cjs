// Run with node tests/verify-data.cjs. No dependencies required.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const memory=new Map();const context={window:{dispatchEvent(){}},document:{documentElement:{dataset:{}}},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},Intl,Date,Event:class{},console};context.window=context;context.dispatchEvent=()=>{};vm.createContext(context);
for(const name of ['site-config','city-data','service-data','utils','shipment-data'])vm.runInContext(fs.readFileSync('assets/js/'+name+'.js','utf8'),context);
const A=context.Arcway,base={origin:'hyderabad',destination:'mumbai',service:'domestic',weight:1,weightUnit:'kg',length:20,width:15,height:10,dimensionUnit:'cm'};
assert.equal(A.calculate(base).total,127);
assert.equal(A.calculate({...base,weight:1000,weightUnit:'g'}).total,127);
assert.equal(A.calculate({...base,weight:2.20462262185,weightUnit:'lb'}).total,127);
assert.equal(A.calculate({...base,length:20/2.54,width:15/2.54,height:10/2.54,dimensionUnit:'in'}).total,127);
assert.equal(A.calculate({...base,length:50,width:40,height:30}).billable,12);
assert.equal(A.calculate({...base,weight:.51,length:1,width:1,height:1}).billable,1);
assert.equal(A.calculate({...base,origin:'mumbai',destination:'delhi'}).zone,35);
assert.equal(A.calculate({...base,origin:'mumbai',destination:'mumbai',service:'local',weight:.5}).total,73); // volumetric .6 => rounded 1kg
assert.throws(()=>A.calculate({...base,service:'local'}),/same pickup/);
for(const weight of [-1,0,Infinity,NaN,71])assert.throws(()=>A.calculate({...base,weight}));
assert.throws(()=>A.calculate({...base,length:201}));assert.throws(()=>A.calculate({...base,length:200,width:200,height:200}),/billable weight/);
for(const s of A.samples){const result=A.calculate({...base,origin:s.origin,destination:s.destination,service:s.service,weight:s.weight,length:10,width:10,height:10});assert.equal(s.amount,result.total,'sample invoice reconciles '+s.id);}
assert.equal(A.stats().total,4);assert.equal(A.stats().transit,2);assert.equal(A.stats().delivered,1);assert.equal(A.stats().pending,1);
const record={id:'AWL-ABCDEF123456',origin:'hyderabad',destination:'mumbai',service:'domestic',date:'2026-11-11',status:'Pickup requested',weight:1,amount:127,events:[{title:'Pickup requested',date:'2026-11-11T10:00:00+05:30',place:'Hyderabad'}]};A.saveShipment(record);A.saveShipment(record);assert.equal(A.stats().total,5);assert.equal(A.stats().pending,2);assert.equal(A.findShipment(record.id).amount,127);
for(const city of A.cities){assert.ok(city.lat>8&&city.lat<37&&city.lng>68&&city.lng<98);}
for(const route of A.routes){assert.equal(route.startLat,A.city(route.origin).lat);assert.equal(route.startLng,A.city(route.origin).lng);assert.equal(route.endLat,A.city(route.destination).lat);assert.equal(route.endLng,A.city(route.destination).lng);}
console.log('PASS: pricing, conversions, bounds, zones, sample invoice reconciliation, state deduplication, counts, city bounds and route endpoints.');
