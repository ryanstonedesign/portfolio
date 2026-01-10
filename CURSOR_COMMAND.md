# Cursor Quick Command: Publish

Copy the prompt below into Cursor's custom command settings.

---

## Command Name

```
Publish
```

## Command Prompt

```
Read the file src/data/CAROUSEL_ORDER.md and extract the ordered list of media filenames from the numbered list. Then update src/data/projects.js by replacing the orderedFiles array with the filenames in the exact order they appear in the markdown file. After updating the file, run these terminal commands in sequence: git add -A && git commit -m "Update carousel order" && git push
```

