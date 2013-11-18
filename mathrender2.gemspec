# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'mathrender2/version'

Gem::Specification.new do |spec|
  spec.name          = "mathrender2"
  spec.version       = Mathrender2::VERSION
  spec.authors       = ["Seth Jeffery", "Ashish Sehra"]
  spec.email         = ["seth@quipper.com", "ashish@quipper.com"]
  spec.description   = "MathRender gem"
  spec.summary       = "Uses PhantomJS, MathJax and librsvg to render MathML as PNG"
  spec.homepage      = "http://www.quipper.com"
  spec.license       = "MIT"

  spec.files         = `git ls-files`.split($/)
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_dependency "phantomjs"
  
  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"
end
