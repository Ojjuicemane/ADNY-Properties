////////////////////////////////////////////////////////////
// MAP INITIALIZATION
////////////////////////////////////////////////////////////

const map = L.map("map").setView(
  [40.75, -73.98],
  11
);

////////////////////////////////////////////////////////////
// BASEMAPS
////////////////////////////////////////////////////////////

const imagery =
  L.esri.basemapLayer("Imagery");

const streets =
  L.esri.basemapLayer("Streets");

const topo =
  L.esri.basemapLayer("Topographic");

imagery.addTo(map);

L.esri
  .basemapLayer("ImageryLabels")
  .addTo(map);

////////////////////////////////////////////////////////////
// NYC MAPPLUTO
////////////////////////////////////////////////////////////

const nycParcels =
  L.esri.featureLayer({

    url:
      "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/MAPPLUTO/FeatureServer/0",

    style: {
      color: "#0080ff",
      weight: 1
    }

  });

nycParcels.on("click", function (e) {

  document.getElementById(
    "details"
  ).innerHTML =
    `<pre>${JSON.stringify(
      e.layer.feature.properties,
      null,
      2
    )}</pre>`;

});

////////////////////////////////////////////////////////////
// ROCKLAND
////////////////////////////////////////////////////////////

const rocklandParcels =
  L.esri.featureLayer({

    url:
      "https://services7.arcgis.com/NbZxijYF6JgLi4dp/ArcGIS/rest/services/Orangetown_Parcels_WFL1/FeatureServer/1",

    style: {
      color: "#ff4d4d",
      weight: 1
    }

  });

////////////////////////////////////////////////////////////
// ORANGE
////////////////////////////////////////////////////////////

const orangeParcels =
  L.esri.dynamicMapLayer({

    url:
      "https://gis.orangecountygov.com/arcgis/rest/services/Dynamic/ParcelViewer/MapServer",

    layers: [7]

  });

////////////////////////////////////////////////////////////
// PUTNAM
////////////////////////////////////////////////////////////

const putnamParcels =
  L.esri.featureLayer({

    url:
      "https://services2.arcgis.com/dU6jdOIkCUj2UDe9/arcgis/rest/services/Putnam_parcels_2024/FeatureServer/0",

    style: {
      color: "#00cc66",
      weight: 1
    }

  });

////////////////////////////////////////////////////////////
// ULSTER
////////////////////////////////////////////////////////////

const ulsterParcels =
  L.esri.featureLayer({

    url:
      "https://gis.ulstercountyny.gov/server/rest/services/Parcel_Viewer/Tax_Parcel_Data/MapServer/0",

    style: {
      color: "#ff9900",
      weight: 1
    }

  });

////////////////////////////////////////////////////////////
// SULLIVAN
////////////////////////////////////////////////////////////

const sullivanParcels =
  L.esri.featureLayer({

    url:
      "https://gis.sullivanny.us/arcgis/rest/services/Parcels/FeatureServer/1",

    style: {
      color: "#9900ff",
      weight: 1
    }

  });

////////////////////////////////////////////////////////////
// DEFAULT LAYER
////////////////////////////////////////////////////////////

nycParcels.addTo(map);

////////////////////////////////////////////////////////////
// LAYER CONTROL
////////////////////////////////////////////////////////////

const baseMaps = {

  "Imagery": imagery,
  "Streets": streets,
  "Topographic": topo

};

const overlays = {

  "NYC MapPLUTO":
    nycParcels,

  "Rockland County":
    rocklandParcels,

  "Orange County":
    orangeParcels,

  "Putnam County":
    putnamParcels,

  "Ulster County":
    ulsterParcels,

  "Sullivan County":
    sullivanParcels

};

L.control.layers(
  baseMaps,
  overlays,
  {
    collapsed: false
  }
).addTo(map);

////////////////////////////////////////////////////////////
// LAYER MONITORING
////////////////////////////////////////////////////////////

function monitorLayer(
  name,
  layer
) {

  layer.on(
    "load",
    function () {

      console.log(
        "SUCCESS:",
        name,
        "loaded"
      );

    }
  );

  layer.on(
    "requesterror",
    function (e) {

      console.error(
        "ERROR:",
        name,
        e
      );

    }
  );

}

monitorLayer(
  "NYC",
  nycParcels
);

monitorLayer(
  "Rockland",
  rocklandParcels
);

monitorLayer(
  "Putnam",
  putnamParcels
);

monitorLayer(
  "Ulster",
  ulsterParcels
);

monitorLayer(
  "Sullivan",
  sullivanParcels
);

////////////////////////////////////////////////////////////
// SERVICE HEALTH CHECKS
////////////////////////////////////////////////////////////

async function testService(
  name,
  url
) {

  try {

    const response =
      await fetch(
        url + "?f=pjson"
      );

    if (
      !response.ok
    ) {

      console.error(
        "FAILED:",
        name,
        response.status
      );

      return;
    }

    const json =
      await response.json();

    console.log(
      "ONLINE:",
      name,
      json.name ||
      json.serviceDescription ||
      "ArcGIS Service"
    );

  }

  catch (err) {

    console.error(
      "ERROR:",
      name,
      err
    );

  }

}

testService(
  "NYC",
  nycParcels.options.url
);

testService(
  "Rockland",
  rocklandParcels.options.url
);

testService(
  "Putnam",
  putnamParcels.options.url
);

testService(
  "Ulster",
  ulsterParcels.options.url
);

testService(
  "Sullivan",
  sullivanParcels.options.url
);

////////////////////////////////////////////////////////////
// ADDRESS SEARCH
////////////////////////////////////////////////////////////

let searchMarker = null;

async function searchAddress() {

  const q =
    document
      .getElementById(
        "addressInput"
      )
      .value
      .trim();

  if (!q) {
    return;
  }

  document
    .getElementById(
      "status"
    )
    .textContent =
    "Searching...";

  const url =
    `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=pjson&maxLocations=1&singleLine=${encodeURIComponent(q)}`;

  try {

    const r =
      await fetch(
        url
      );

    const d =
      await r.json();

    if (
      !d.candidates ||
      d.candidates.length === 0
    ) {

      document
        .getElementById(
          "status"
        )
        .textContent =
        "No match found";

      return;

    }

    const c =
      d.candidates[0];

    if (
      searchMarker
    ) {

      map.removeLayer(
        searchMarker
      );

    }

    searchMarker =
      L.marker([
        c.location.y,
        c.location.x
      ]).addTo(map);

    searchMarker
      .bindPopup(
        c.address
      )
      .openPopup();

    map.setView(
      [
        c.location.y,
        c.location.x
      ],
      17
    );

    document
      .getElementById(
        "status"
      )
      .textContent =
      c.address;

  }

  catch (err) {

    console.error(
      err
    );

    document
      .getElementById(
        "status"
      )
      .textContent =
      "Search error";

  }

}

////////////////////////////////////////////////////////////
// SEARCH EVENTS
////////////////////////////////////////////////////////////

document
  .getElementById(
    "searchBtn"
  )
  .addEventListener(
    "click",
    searchAddress
  );

document
  .getElementById(
    "addressInput"
  )
  .addEventListener(
    "keydown",
    function (e) {

      if (
        e.key ===
        "Enter"
      ) {

        searchAddress();

      }

    }
  );

////////////////////////////////////////////////////////////
// STARTUP
////////////////////////////////////////////////////////////

document
  .getElementById(
    "status"
  )
  .textContent =
  "Ready - Search by address";
