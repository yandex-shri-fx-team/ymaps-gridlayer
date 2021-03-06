# Yandex Maps API GridmapLayer Module

Yandex.Maps API module for data visualization.

**GridmapLayer** is a graphical representation of some spatial data, where depending on the number of entered points grid cells are painted in different colors.
`GridmapLayer` class allows to construct and display such representations over geographical maps.

## Loading

1. Put module source code ([gridmap-layer.min.js](https://github.com/yandex-shri-fx-team/ymaps-gridmap/blob/master/umd/gridmap-layer.min.js)) on your CDN.

2. Load both [Yandex Maps JS API 2.1](http://api.yandex.com/maps/doc/jsapi/) and module source code by adding following code into &lt;head&gt; section of your page:

   ```html
   <script src="http://api-maps.yandex.ru/2.1/?lang=ru_RU" type="text/javascript"></script>
   <!-- Change my.cdn.tld to your CDN host name -->
   <script src="http://my.cdn.tld/gridmap.min.js" type="text/javascript"></script>
   ```

   If you use [GeoJSON](http://geojson.org) data:

   ```html
   <script src="http://api-maps.yandex.ru/2.1/?lang=ru_RU&coordOrder=longlat" type="text/javascript"></script>
   <!-- Change my.cdn.tld to your CDN host name -->
   <script src="http://my.cdn.tld/gridmap.min.js" type="text/javascript"></script>
   ```

   If you use [npm](https://www.npmjs.com):

   ```html
   <script src="http://api-maps.yandex.ru/2.1/?lang=ru_RU" type="text/javascript"></script>
   ```

   ```bash
   npm i --save git+https://github.com/yandex-shri-fx-team/ymaps-gridmap-layer.git
   ```

   ```js
   require('ymaps-gridmap-layer');

   // Or with babel
   import 'ymaps-gridmap-layer';
   ```

3. Get access to module functions by using [ymaps.modules.require](http://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/modules.require.xml) method:

   ```js
   ymaps.modules.require(['GridmapLayer'], function (GridmapLayer) {
        var gridmap = new GridmapLayer();
   });
   ```

## Modules

<dl>
<dt><a href="#module_GridmapLayer">GridmapLayer</a></dt>
<dd><p>GridmapLayer module.</p>
</dd>
<dt><a href="#module_HotspotObjectSourceBrowser">HotspotObjectSourceBrowser</a></dt>
<dd><p>HotspotObjectSourceBrowser.</p>
</dd>
</dl>

<a name="module_GridmapLayer"></a>

## GridmapLayer
GridmapLayer module.

**Requires**: <code>module:Layer</code>, <code>module:util.hd</code>, <code>module:util.defineClass</code>, <code>module:util.extend</code>, [<code>HotspotObjectSourceBrowser</code>](#module_HotspotObjectSourceBrowser), <code>module:option.Manager</code>  

* [GridmapLayer](#module_GridmapLayer)
    * [GridmapLayer](#exp_module_GridmapLayer--GridmapLayer) ⏏
        * [new GridmapLayer(data, [options])](#new_module_GridmapLayer--GridmapLayer_new)
        * [~tileTransparent](#module_GridmapLayer--GridmapLayer..tileTransparent)

<a name="exp_module_GridmapLayer--GridmapLayer"></a>

### GridmapLayer ⏏
**Kind**: Exported class  
<a name="new_module_GridmapLayer--GridmapLayer_new"></a>

#### new GridmapLayer(data, [options])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | Object of points. |
| [options] | <code>Object</code> |  | Options for customization. |
| options.map | <code>Imap</code> |  | Required. Map. |
| [options.debug] | <code>boolean</code> | <code>false</code> | Flag to show debug. |
| options.gridType | <code>string</code> |  | Required. Type of grid can be "hexagon" | "square". |
| [options.gridHexagonRadius] | <code>string</code> | <code>15</code> | Radius of hexagon. |
| [options.gridSquareSidelength] | <code>string</code> | <code>15</code> | Side length of square. |
| [options.filterEmptyShapes] | <code>boolean</code> | <code>false</code> | Flag to render empty shapes. |
| [options.emptyShapesColor] | <code>string</code> | <code>&quot;rgba(255,255,255, 0)&quot;</code> | Fill color of shapes where points count equal 0. |
| options.shapeColor | <code>function</code> |  | Function to get fill color of shape. Receives count point in shape and total point count. |
| [options.strokeColor] | <code>string</code> | <code>&quot;#666&quot;</code> | Color of shapes stroke. |
| [options.strokeWidth] | <code>number</code> | <code>1</code> | Width of shapes stroke. |
| options.getHotspotProps | <code>functions</code> |  | Properties of hotspot layer. |
| [options.hotspotLayerOptions] | <code>Object</code> |  | Options of hotspot layer. |
| [options.hotspotLayerOptions.zIndex] | <code>number</code> | <code>201</code> | ZIndex of hotspot. |
| [options.hotspotLayerOptions.cursor] | <code>Object</code> | <code>pointer</code> | Cursor of hotspot. |
| options.onMouseEnter | <code>function</code> |  | Hadler of mouseEnter event. |
| options.onMouseLeave | <code>function</code> |  | Hadler of mouseLeave event. |
| options.onClick | <code>function</code> |  | Hadler of click event. |
| options.onBalloonClose | <code>function</code> |  | Hadler of baloon close event. |
| options.balloonContent | <code>function</code> |  | Render baloon html. Receive array of points. |
| [options.interactivity] | <code>boolean</code> | <code>true</code> | Flag to enable interactivity. |

<a name="module_GridmapLayer--GridmapLayer..tileTransparent"></a>

#### GridmapLayer~tileTransparent
This is necessary because otherwise tiles are rendered
on top of the previously rendered tiles that create a weird effect.

**Kind**: inner property of [<code>GridmapLayer</code>](#exp_module_GridmapLayer--GridmapLayer)  
<a name="module_HotspotObjectSourceBrowser"></a>

## HotspotObjectSourceBrowser
HotspotObjectSourceBrowser.

**Requires**: <code>module:util.defineClass</code>, <code>module:util.extend</code>, <code>module:hotspot.ObjectSource</code>  

## Examples

### Creating a simple map

```javascript
const map = new ymaps.Map('idOfMap', {
    center: [55.76, 37.64],
    zoom: 10,
    controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
}, {
    minZoom: 8
});

const gridmap = new GridmapLayer(data, {
    map,
    gridType: 'hexagon',
    gridHexagonRadius: 15,
    filterEmptyShapes: true
});
```

### Adding events

All events of [hotspot.Layer](https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/hotspot.Layer-docpage/#%D0%A1%D0%BE%D0%B1%D1%8B%D1%82%D0%B8%D1%8F) are avaiable.

```javascript
const gridmap = new GridmapLayer(data, {
    map,
    gridType: 'hexagon',
    gridHexagonRadius: 15,
    filterEmptyShapes: true
});

gridmap.events.add('mouseenter', (e) => {
    const activeShape = e.originalEvent.activeObject;
    polygonHover = new ymaps.Polygon([activeShape._properties.objectGeometry], {
        hintContent: 'Polygon'
    }, {
        fillColor: '#00FF0088',
        strokeWidth: 3
    });
    map.geoObjects.add(polygonHover);
});

gridmap.events.add('mouseleave', (e) => {
    map.geoObjects.remove(polygonHover);
});
```

### Changing interactivity

In order to change the hotspot.Layer's default options, user could pass hotspotLayerOptions, which
are described [here](https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/hotspot.Layer-docpage/#param-options).

```javascript
const gridmap = new GridmapLayer(data, {
    map,
    gridType: 'hexagon',
    gridHexagonRadius: 15,
    hotspotLayerOptions: {
        zIndex: 201,
        interactivityModel: 'default#opaque'
    }
});
```

## Demo

- https://yandex-shri-fx-team.github.io/ymaps-gridmap-layer
