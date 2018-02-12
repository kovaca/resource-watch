import React from 'react';
import PropTypes from 'prop-types';

function MapPopup({
  interaction,
  interactionSelected,
  interactionLayers,
  onChangeInteractiveLayer
}) {
  const layer =
    interactionLayers.find(l => l.id === interactionSelected) ||
    interactionLayers[0];

  const layerInteraction = interaction[layer.id] || {};

  const { data, interactionConfig } = layerInteraction;

  return (
    <div className="c-map-popup">
      <header className="popup-header">
        <select
          className="popup-header-select"
          name="interactionLayers"
          value={layer.id}
          onChange={e => onChangeInteractiveLayer(e.target.value)}
        >
          {interactionLayers.map(o =>
            <option key={o.id} value={o.id}>{o.name}</option>
          )}
        </select>

        {/* <button className="">
          <Icon
            name="icon-close"
            className="-default"
          />
        </button> */}
      </header>

      <div className="popup-content">
        {data &&
          <table className="popup-table">
            <tbody>
              {Object.keys(data).map((d) => {
                const outputItem = interactionConfig.output.find(o => o.column === d) || {};

                return (
                  <tr
                    className="dc"
                    key={d}
                  >
                    <td className="dt">
                      {outputItem.property || d}:
                    </td>
                    <td className="dd">{data[d]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        }

        {!data &&
          'No data available'
        }
      </div>
    </div>
  );
}

MapPopup.propTypes = {
  interaction: PropTypes.object,
  interactionLayers: PropTypes.array,
  interactionSelected: PropTypes.string,
  onChangeInteractiveLayer: PropTypes.func
};

export default MapPopup;