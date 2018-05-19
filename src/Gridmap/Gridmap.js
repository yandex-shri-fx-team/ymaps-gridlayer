import Hexagon from './utils/Hexagon';
import Square from './utils/Square';
import RTree from 'rtree';
import classifyPoint from 'robust-point-in-polygon';
import './HotspotObjectSourceBrowser';
import defaultOnMouseEnter from './utils/defaultOnMouseEnter';
import defaultOnMouseLeave from './utils/defaultOnMouseLeave';
import defaultOnClick from './utils/defaultOnClick';
import defaultBalloonClose from './utils/defaultBalloonClose';

/**
 * @typedef {HexagonGridOptions}
 * @property {number} bigRadius
 * @property {string} type
 */

/**
 * @typedef {SquareGridOptions}
 * @property {number} sideLength
 * @property {string} type
 */

/**
 * @typedef {GridmapOptions}
 * @property {IMap} map
 * @property {IGeoJSON} data
 * @property {SquareGridOptions|HexagonGridOptions} grid
 */

ymaps.modules.define('Gridmap', [
    'Layer',
    'util.hd',
    'util.defineClass',
    'util.extend',
    'HotspotObjectSourceBrowser'
], (provide, Layer, utilHd, defineClass, extend, HotspotObjectSourceBrowser) => {
    const dpr = utilHd.getPixelRatio();

    class Gridmap {
        constructor(options) {
            const TILE_SIZE = 256;
            this._options = options;
            this._projection = this._options.map.options.get('projection');
            this._data = options.data.features;
            this._canvas = document.createElement('canvas');
            this._canvas.width = TILE_SIZE * dpr;
            this._canvas.height = TILE_SIZE * dpr;
            this._tileSize = TILE_SIZE;
            this._context = this._canvas.getContext('2d');
            this._buildTree();

            switch (options.grid.type) {
                case 'hexagon': {
                    this._shape = new Hexagon(this._options.grid.bigRadius);
                    break;
                }
                case 'square': {
                    this._shape = new Square(this._options.grid.sideLength);
                    break;
                }
                default: {
                    throw new Error('Unknowk grid type');
                }
            }

            this._debug = true;

            const tileUrlTemplate = (tileNumber, tileZoom) => this.getDataURL(tileNumber, tileZoom);

            const layer = new ymaps.Layer(tileUrlTemplate, {
                /**
                 * This is necessary because otherwise tiles are rendered
                 * on top of the previously rendered tiles that create a weird effect.
                 */
                tileTransparent: true
            });
            const objSource = new HotspotObjectSourceBrowser(tileUrlTemplate, {
                getHotspotsForTile: (tileNumber, zoom) => this._getHotspotsForTile(tileNumber, zoom)
            });

            const hotspotLayer = new ymaps.hotspot.Layer(objSource, {zIndex: 201, cursor: 'help'});

            this._initInteractivity(hotspotLayer);

            this._options.map.layers.add(hotspotLayer);
            this._options.map.layers.add(layer);
        }

        _initInteractivity(hotspotLayer) {
            this.polygonHover = null;
            this.polygonActive = null;
            this.onMouseEnter = defaultOnMouseEnter.bind(this);
            this.onMouseLeave = defaultOnMouseLeave.bind(this);
            this.onClick = defaultOnClick.bind(this);
            this.onBalloonClose = defaultBalloonClose.bind(this);

            hotspotLayer.events.add('mouseenter', this.onMouseEnter);
            hotspotLayer.events.add('mouseleave', this.onMouseLeave);
            hotspotLayer.events.add('click', this.onClick);
            hotspotLayer.events.add('balloonclose', this.onBalloonClose);
        }

        _buildTree() {
            this._tree = new RTree();
            this._treeZoom = this._options.map.getZoom();
            this._data.forEach((feature) => {
                const [x, y] = this._projection.toGlobalPixels(
                    feature.geometry.coordinates, this._treeZoom);

                const point = {
                    feature,
                    pixelCoords: [x, y]
                };
                this._tree.insert(
                    {
                        x,
                        y,
                        w: 0,
                        h: 0
                    },
                    point);
            });
        }

        _getScale() {
            return Math.pow(2, this._treeZoom - this._options.map.getZoom());
        }
        _getPointsForShape(shapeCenter, offset) {
            const [x, y] = shapeCenter;
            const scale = this._getScale();
            const globalBbox = this._shape.getBBox(shapeCenter, offset, scale);
            const shape = this._shape.getPixelVertices([x, y], offset, 1, scale);
            return this._tree
                .search(globalBbox)
                .filter(({pixelCoords}) => classifyPoint(shape, pixelCoords) <= 0);
        }

        _getTileOffset(tileNumber, tileSize) {
            return [
                tileNumber[0] * tileSize,
                tileNumber[1] * tileSize
            ];
        }

        _getHotspotsForTile(tileNumber) {
            const result = [];
            const scale = this._getScale();
            const shapes = this._shape.getCentersForTile(tileNumber, this._tileSize, scale);
            const offset = this._getTileOffset(tileNumber, this._tileSize);
            shapes.forEach(([x, y]) => {
                const points = this._getPointsForShape([x, y], offset);
                if (points.length > 0) {
                    const hexagon = this._shape.getPixelVertices([x, y], [0, 0], 1, scale);
                    const objectGeometry = hexagon.map(([hX, hY]) => this._projection.fromGlobalPixels(
                        [parseFloat(hX) + parseFloat(offset[0]), parseFloat(hY) +
                        parseFloat(offset[1])], this._options.map.getZoom()));
                    result.push({
                        type: 'Feature',
                        properties: {
                            balloonContentBody: `Тут ${points.length} точек!`,
                            balloonContentHeader: JSON.stringify(hexagon),
                            balloonContentFooter: 'Нижняя часть балуна.',
                            objectGeometry: objectGeometry,
                            // Можно задавать свойство balloonContent вместо Body/Header/Footer
                            // Обязательное поле
                            HotspotMetaData: {
                                // Идентификатор активной области.
                                id: JSON.stringify(points),
                                // Данные, на основе которых создается геометрия активной области.
                                // Обязательное поле.
                                RenderedGeometry: {
                                    type: 'Polygon',
                                    coordinates: [
                                        hexagon
                                    ]
                                }
                            }
                        }
                    });
                }
            });

            return result;
        }

        _drawTile(tileNumber) {
            const scale = this._getScale();
            const shapesCenters = this._shape.getCentersForTile(tileNumber, this._tileSize, scale);
            const offset = this._getTileOffset(tileNumber, this._tileSize);

            this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);

            shapesCenters.forEach(([x, y]) => {
                const points = this._getPointsForShape([x, y], offset);
                const hexagon = this._shape.getPixelVertices([x, y], [0, 0], dpr, scale);
                this._context.beginPath();
                hexagon.forEach(([x, y], idx) => {
                    if (idx === 0) {
                        this._context.moveTo(x, y);
                    } else {
                        this._context.lineTo(x, y);
                    }
                });
                this._context.fillStyle = this._options.getShapeColor(points.length, this._data.length);
                this._context.fill();
                this._context.stroke();
                if (this._debug) {
                    this._context.fillStyle = 'black';
                    this._context.fillText(points.length, x, y);
                }
                this._context.closePath();
            });
        }

        getDataURL(tileNumer, zoom) {
            this._drawTile(tileNumer, zoom);
            return this._canvas.toDataURL();
        }
    }

    provide(Gridmap);
});
