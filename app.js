/////////////////////////////////////////////////////////
// MAP
/////////////////////////////////////////////////////////

const map = L.map("map").setView(
  [40.75, -73.98],
  11
);

const imagery =
  L.esri.basemapLayer("Imagery");

imagery.addTo(map);

L.esri
 .basemapLayer("ImageryLabels")
 .addTo(map);

/////////////////////////////////////////////////////////
// NYC PARCELS
/////////////////////////////////////////////////////////

const nycParcels =
L.esri.featureLayer({

    url:
    "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/MAPPLUTO/FeatureServer/0",

    style:{
        color:"#3b82f6",
        weight:1,
        opacity:.75
    }

});

nycParcels.addTo(map);

/////////////////////////////////////////////////////////
// COUNTY LAYERS
/////////////////////////////////////////////////////////

const NewYorkParcles =
L.esri.featureLayer({

 url:
 "https://zola.planning.nyc.gov/about#9.72/40.6756/-73.8197"

});


const rocklandParcels =
L.esri.featureLayer({

 url:
 "https://services7.arcgis.com/NbZxijYF6JgLi4dp/ArcGIS/rest/services/Orangetown_Parcels_WFL1/FeatureServer/1"

});

const orangeParcels =
L.esri.dynamicMapLayer({

 url:
 "https://gis.orangecountygov.com/arcgis/rest/services/Dynamic/ParcelViewer/MapServer",

 layers:[7]

});

const putnamParcels =
L.esri.featureLayer({

 url:
 "https://services2.arcgis.com/dU6jdOIkCUj2UDe9/arcgis/rest/services/Putnam_parcels_2024/FeatureServer/0"

});

const ulsterParcels =
L.esri.featureLayer({

 url:
 "https://gis.ulstercountyny.gov/server/rest/services/Parcel_Viewer/Tax_Parcel_Data/MapServer/0"

});

const sullivanParcels =
L.esri.featureLayer({

 url:
 "https://gis.sullivanny.us/arcgis/rest/services/Parcels/FeatureServer/1"

});

/////////////////////////////////////////////////////////
// PARCEL CLICK
/////////////////////////////////////////////////////////

nycParcels.on("click", function(e){

 const p =
 e.layer.feature.properties;

 document.getElementById(
  "parcelContent"
 ).innerHTML = `

 <div class="property-stat">
   <div class="property-label">
     Address
   </div>
   <div class="property-value">
     ${p.Address || ''}
   </div>
 </div>

 <div class="property-stat">
   <div class="property-label">
      Owner
   </div>
   <div class="property-value">
      ${p.OwnerName || 'Unknown'}
   </div>
 </div>

 <div class="property-stat">
   <div class="property-label">
      BBL
   </div>
   <div class="property-value">
      ${p.BBL || ''}
   </div>
 </div>

 <hr>

 <h3>Data Provenance</h3>

 <div class="property-stat">
    <div class="property-label">
      Source Agency
    </div>
    <div class="property-value">
      NYC Department of City Planning
    </div>
 </div>

 <div class="property-stat">
    <div class="property-label">
      Dataset
    </div>
    <div class="property-value">
      MapPLUTO
    </div>
 </div>

 <div class="property-stat">
    <div class="property-label">
      Verification
    </div>
    <div class="property-value">
      Verified Public Record
    </div>
 </div>

 `;
});

/////////////////////////////////////////////////////////
// SEARCH
/////////////////////////////////////////////////////////

let searchMarker = null;

async function searchAddress(){

 const q =
 document.getElementById(
   "addressInput"
 ).value;

 if(!q) return;

 document.getElementById(
   "statusBar"
 ).innerHTML =
 "Searching...";

 const url =
 `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=pjson&singleLine=${encodeURIComponent(q)}&maxLocations=1`;

 try{

   const r =
   await fetch(url);

   const d =
   await r.json();

   if(
     d.candidates &&
     d.candidates.length
   ){

      const c =
      d.candidates[0];

      if(searchMarker){

        map.removeLayer(
          searchMarker
        );

      }

      searchMarker =
      L.marker([
        c.location.y,
        c.location.x
      ]).addTo(map);

      map.setView(
        [
         c.location.y,
         c.location.x
        ],
        18
      );

      document.getElementById(
       "statusBar"
      ).innerHTML =
      c.address;
   }

 }catch(err){

   console.error(err);

   document.getElementById(
    "statusBar"
   ).innerHTML =
   "Search failed";
 }

}

document
.getElementById(
 "searchBtn"
)
.addEventListener(
 "click",
 searchAddress
);

/////////////////////////////////////////////////////////
// LAYER TOGGLES
/////////////////////////////////////////////////////////

function bindToggle(
  id,
  layer
){

 document
  .getElementById(id)
  .addEventListener(
   "change",
   function(){

    if(this.checked){

      map.addLayer(
       layer
      );

    }else{

      map.removeLayer(
       layer
      );

    }

   }
  );
}

bindToggle(
 "nycToggle",
 nycParcels
);

bindToggle(
 "rocklandToggle",
 rocklandParcels
);

bindToggle(
 "orangeToggle",
 orangeParcels
);

bindToggle(
 "putnamToggle",
 putnamParcels
);

bindToggle(
 "ulsterToggle",
 ulsterParcels
);

bindToggle(
 "sullivanToggle",
 sullivanParcels
);
