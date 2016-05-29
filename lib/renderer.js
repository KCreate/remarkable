'use strict';

/**
 * Local dependencies
 */

var utils = require('./common/utils');
var rules = require('./rules');

/**
 * Expose `Renderer`
 */

module.exports = Renderer;

/**
 * Renderer class. Renders HTML and exposes `rules` to allow
 * local modifications.
 */

function Renderer() {
  this.rules = utils.assign({}, rules);

  // exported helper, for custom rules only
  this.getBreak = rules.getBreak;
}

/**
 * Render a string of inline HTML with the given `tokens` and
 * `options`.
 *
 * @param  {Array} `tokens`
 * @param  {Object} `options`
 * @param  {Object} `env`
 * @return {String}
 * @api public
 */

Renderer.prototype.renderInline = function (tokens, options, env) {
  var _rules = this.rules;
  var len = tokens.length, i = 0;
  var result = '';

  while (len--) {
    result += _rules[tokens[i].type](tokens, i++, options, env, this);
  }

  return result;
};

/**
 * Render a string of HTML with the given `tokens` and
 * `options`.
 *
 * @param  {Array} `tokens`
 * @param  {Object} `options`
 * @param  {Object} `env`
 * @return {String}
 * @api public
 */

Renderer.prototype.render = function (tokens, options, env) {
  var _rules = this.rules;
  var len = tokens.length, i = -1;
  var result = '';

  if (options.imagesAreBlocks) {
      tokens = tokens.filter(function(current, index, tokens) {
          if (current.type == 'paragraph_open' && tokens[index + 1].type == 'inline') {
              if (tokens[index + 1].children) {
                  if (tokens[index + 1].children[0]) {
                      if (tokens[index + 1].children[0].type == 'image') {
                          return false;
                      }
                  }
              }
          }
          if (current.type == 'paragraph_close' && tokens[index - 1].type == 'inline') {
              if (tokens[index - 1].children) {
                  if (tokens[index - 1].children[0]) {
                      if (tokens[index - 1].children[0].type == 'image') {
                          return false;
                      }
                  }
              }
          }
          return true;
      });

      len = tokens.length;
  }

  while (++i < len) {
    if (tokens[i].type === 'inline') {
      result += this.renderInline(tokens[i].children, options, env);
    } else {
      result += _rules[tokens[i].type](tokens, i, options, env, this);
    }
  }
  return result;
};
