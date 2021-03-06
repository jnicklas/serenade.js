%start Root

%%

Root
  : ChildList { return $1 }
  ;

ChildList
  : Child { $$ = [].concat($1) }
  | ChildList TERMINATOR Child { $$ = $1.concat($3) }
  ;

ElementIdentifier
  : AnyIdentifier { $$ = { name: $1, type: "__element" } }
  | AnyIdentifier HASH AnyIdentifier { $$ = { name: $1, options: [{ name: "id", property: $3 }], type: "__element" } }
  | HASH AnyIdentifier { $$ = { name: "div", options: [{ name: "id", property: $2 }], type: "__element" } }
  | DOT AnyIdentifier { $$ = { name: "div", classes: [$2], type: "__element" } }
  | ElementIdentifier DOT AnyIdentifier { $1.classes = ($1.classes || []).concat($3); $$ = $1 }
  ;

Element
  : ElementIdentifier { $$ = $1 }
  | Element LBRACKET RBRACKET { $$ = $1 }
  | Element LBRACKET PropertyList RBRACKET { $1.options = ($1.options || []).concat($3); $$ = $1 }
  | Element WHITESPACE Content { $1.children = ($1.children || []).concat($3); $$ = $1 }
  | Element INDENT ChildList OUTDENT { $1.children = ($1.children || []).concat($3); $$ = $1 }
  ;

ContentList
  : Content { $$ = [$1] }
  | ContentList WHITESPACE Content { $$ = $1.concat($3) }
  ;

Content
  : Bound { $$ = { type: "__content", arguments: [{ property: $1, bound: true }] } }
  | STRING_LITERAL { $$ = { type: "__content", arguments: [{ property: $1 }] } }
  ;

Child
  : Element { $$ = $1 }
  | IfInstruction { $$ = $1 }
  | Instruction { $$ = $1 }
  | ContentList { $$ = $1 }
  ;

PropertyList
  : Property { $$ = [$1] }
  | PropertyList WHITESPACE Property { $$ = $1.concat($3) }
  ;

Property
  : AnyIdentifier EQUALS PropertyArgument { $3.name = $1; $$ = $3 }
  | AnyIdentifier EQUALS PropertyArgument BANG { $3.name = $1; $3.preventDefault = true; $$ = $3 }
  | AnyIdentifier COLON Property { $3.scope = $1; $$ = $3 }
  ;

PropertyArgumentList
  : PropertyArgument { $$ = [$1] }
  | PropertyArgumentList WHITESPACE PropertyArgument { $$ = $1.concat($3) }
  ;

PropertyArgument
  : AnyIdentifier { $$ = { bound: true, property: $1 } }
  | Bound { $$ = { bound: true, property: $1 } }
  | STRING_LITERAL { $$ = { property: $1 } }
  | LBRACKET PropertyArgumentList RBRACKET { $$ = { collection: true, arguments: $2 } }
  | AnyIdentifier LPAREN PropertyArgumentList RPAREN { $$ = { filter: $1, arguments: $3 } }
  ;

Instruction
  : DASH WHITESPACE IDENTIFIER { $$ = { type: $3 } }
  | DASH WHITESPACE IDENTIFIER WHITESPACE PropertyArgumentList { $$ = { type: $3, arguments: $5 } }
  | Instruction INDENT ChildList OUTDENT { $1.children = $3; $$ = $1 }
  ;

IfInstruction
  : DASH WHITESPACE IF WHITESPACE PropertyArgumentList { $$ = { arguments: $5, type: "if" } }
  | IfInstruction INDENT ChildList OUTDENT { $1.children = $3; $$ = $1 }
  | IfInstruction ElseInstruction { $1.else = $2; $$ = $1 }
  ;

ElseInstruction
  : DASH WHITESPACE ELSE INDENT ChildList OUTDENT { $$ = { children: $5, type: "else" } }
  ;

AnyIdentifier
  : IF { $$ = $1 }
  | ELSE { $$ = $1 }
  | IDENTIFIER { $$ = $1 }
  ;

Bound
  : AT AnyIdentifier { $$ = "@" + $2 }
  | DOLLAR AnyIdentifier { $$ = $2 }
  | AT { $$ = "this" }
  ;
