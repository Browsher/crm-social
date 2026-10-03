import {createHash} from 'node:crypto';
import {builtinRules} from 'eslint/use-at-your-own-risk';
const complexity=builtinRules.get('complexity');
function identity(node,source) {
  const tokens=n=>JSON.stringify(source.getTokens(n).map(t=>[t.type,t.value]));
  function binding(n) {
    if(/^(?:Function|Class)(?:Declaration|Expression)$/.test(n.type)&&n.id) return 'name:'+n.id.name;
    if(n.type==='VariableDeclarator') return 'var:'+tokens(n.id);
    if(['Property','MethodDefinition','PropertyDefinition'].includes(n.type)&&!n.computed) return 'key:'+tokens(n.key);
    if(n.type==='AssignmentExpression') return 'assign:'+tokens(n.left);
    if(n.type==='ExportDefaultDeclaration') return 'export-default';
    return null;
  }
  const direct=binding(node)??(['VariableDeclarator','Property','MethodDefinition','PropertyDefinition','AssignmentExpression','ExportDefaultDeclaration'].includes(node.parent?.type)?binding(node.parent):null);
  const context=[];
  for(let ancestor=node.parent;ancestor;ancestor=ancestor.parent) {
    const label=binding(ancestor);
    if(label) context.unshift(label);
    else if(/^(?:ArrowFunctionExpression|FunctionExpression)$/.test(ancestor.type)) context.unshift('anonymous:'+tokens(ancestor));
  }
  // Unbound callbacks use token fingerprints. Edits become new functions;
  // unchanged callbacks survive movement. Duplicate contexts receive no legacy waiver.
  return createHash('sha256').update(JSON.stringify([context,direct??tokens(node)])).digest('hex');
}
const identified={
  ...complexity,
  meta:{...complexity.meta,messages:{complex:complexity.meta.messages.complex+' Identity: {{identity}}.'}},
  create(context) {
    const delegated=Object.create(context);
    Object.defineProperty(delegated,'report',{value:descriptor=>context.report({...descriptor,data:{...descriptor.data,identity:identity(descriptor.node,context.sourceCode)}})});
    return complexity.create(delegated);
  }
};
export default [{
  files:['**/*.js','**/*.cjs','**/*.mjs'],
  languageOptions:{ecmaVersion:'latest'},
  plugins:{'node-kit':{rules:{complexity:identified}}},
  rules:{'node-kit/complexity':['error',{max:0,variant:'classic'}]}
}];
