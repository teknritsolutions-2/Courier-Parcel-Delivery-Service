'use strict';
// GeoNames city centers. WGS84 degrees, north/east positive. CC BY 4.0; see asset-credits.md.
Arcway.cities = Object.freeze([
{id:'hyderabad',name:'Hyderabad',region:'South',state:'Telangana',lat:17.38405,lng:78.45636},
{id:'mumbai',name:'Mumbai',region:'West',state:'Maharashtra',lat:19.07283,lng:72.88261},
{id:'bengaluru',name:'Bengaluru',region:'South',state:'Karnataka',lat:12.97194,lng:77.59369},
{id:'chennai',name:'Chennai',region:'South',state:'Tamil Nadu',lat:13.08784,lng:80.27847},
{id:'delhi',name:'Delhi',region:'North',state:'Delhi',lat:28.65195,lng:77.23149},
{id:'kolkata',name:'Kolkata',region:'East',state:'West Bengal',lat:22.56263,lng:88.36304},
{id:'kochi',name:'Kochi',region:'South',state:'Kerala',lat:9.93988,lng:76.26022},
{id:'pune',name:'Pune',region:'West',state:'Maharashtra',lat:18.51957,lng:73.85535},
{id:'ahmedabad',name:'Ahmedabad',region:'West',state:'Gujarat',lat:23.02579,lng:72.58727}
]);
Arcway.city = id => Arcway.cities.find(c=>c.id===id);
Arcway.routes = [['hyderabad','mumbai'],['hyderabad','bengaluru'],['mumbai','delhi'],['chennai','kolkata'],['mumbai','kochi']].map(([origin,destination],i)=>({id:i,origin,destination,startLat:Arcway.city(origin).lat,startLng:Arcway.city(origin).lng,endLat:Arcway.city(destination).lat,endLng:Arcway.city(destination).lng}));
