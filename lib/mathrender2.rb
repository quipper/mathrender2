require_relative "mathrender2/version"
require 'phantomjs'
require 'tempfile'

module Mathrender2
  
  class << self

    def render_png(mathml, file_path='sample.png')
      path = File.join(File.dirname(__FILE__), 'tmp', "math_#{ Time.now.to_i }#{ rand(100) }.png")

      output = Phantomjs.run File.join(File.dirname(__FILE__), 'mathrender2', 'jax.js'), mathml, path
      png_data = File.read(path)
      File.delete(path)
      png_data
    end

  end
end


# math = '<math display="block"><mrow><mi>x</mi><mo>=</mo><mfrac><mrow><mo>−</mo><mi>b</mi><mo>±</mo><msqrt><mrow><msup><mi>b</mi><mn>2</mn></msup><mo>−</mo><mn>4</mn><mi>a</mi><mi>c</mi></mrow></msqrt></mrow><mrow><mn>2</mn><mi>a</mi></mrow></mfrac></mrow></math>'
# puts Mathrender2.render_png(math, 'lib/sample2.png')