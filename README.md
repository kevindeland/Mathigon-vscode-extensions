# Mathigon VS Code Extension

This is an Extension for [Visual Studio Code](https://code.visualstudio.com/) to help navigate the code for [Mathigon textbooks](https://github.com/mathigon/textbooks).


## Features


### Step Definition Jumping
When editing a *content.md* markdown file, you can use the [Go to Definition](https://code.visualstudio.com/Docs/editor/editingevolved#_go-to-definition) command on a Step's ID to navigate to the function where that Step's JavaScript defined. 

When the cursor is over the id, there are two ways to navigate to the definition:
    
- press `F12`
- hold `Option` (Mac) or `Ctrl` (PC) and click
![feature Step ID Definition](images/medians-content-1.gif)

You can also hold `Option` (Mac) or `Ctrl` (PC) and hover the mouse over the ID to see a preview of the function. 

![feature Step ID Definition](images/medians-content-2.gif)


### Glossary Definition Lookup.
When editing a *content.md* markdown file, you can use the [Go to Definition](https://code.visualstudio.com/Docs/editor/editingevolved#_go-to-definition) command to jump to or preview a term's definition in the glossary.

Press `F12` or hold `Option` and click on a glossary term to jump to its definition.
![Glossary term definition](images/gloss-lookup-2.gif)

Or hold `Option` and hover over the term to preview its definition.
![Glossary term preview](images/gloss-lookup-1.gif)

This also works for bios.
![Biography lookup](images/bio-lookup.gif)



## Set up.

Clone this repo and put it in your `$HOME/.vscode/extensions/` folder.

Change into this directory and run `npm install`.


## Release Notes

### 1.0.0
Initial Release. Has features for Step Definition Lookup and Gloss/Bio Definition Lookup.

## TODO List
- Remove/Improve Log Statements
- add camelCase to hyphen-format function
- add a Keyboard shortcut for the Step Finder.



