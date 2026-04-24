const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    const { data } = req.body; // [cite: 12]
    
    let invalidEntries = [];
    let duplicateEdges = [];
    let validEdges = [];
    let seenEdges = new Set();
    let childToParent = {}; // To ensure a child has only one parent [cite: 51]

    // 1. Validation & Filtering [cite: 36, 37, 39, 40]
    data.forEach(entry => {
        const trimmed = entry.trim();
        const regex = /^[A-Z]->[A-Z]$/;
        
        if (!regex.test(trimmed) || trimmed[0] === trimmed[trimmed.length-1]) {
            invalidEntries.push(entry); // [cite: 38, 39]
            return;
        }

        if (seenEdges.has(trimmed)) {
            if (!duplicateEdges.includes(trimmed)) duplicateEdges.push(trimmed); // [cite: 42, 43]
            return;
        }

        const [parent, child] = trimmed.split('->');
        
        // Multi-parent rule: first parent wins [cite: 51, 52]
        if (childToParent[child]) {
            return; 
        }

        seenEdges.add(trimmed);
        validEdges.push({ parent, child });
        childToParent[child] = parent;
    });

    // 2. Tree Construction Logic [cite: 44, 47]
    const nodes = new Set();
    const adj = {};
    validEdges.forEach(({ parent, child }) => {
        nodes.add(parent);
        nodes.add(child);
        if (!adj[parent]) adj[parent] = [];
        adj[parent].push(child);
    });

    const roots = Array.from(nodes).filter(node => !childToParent[node]); // [cite: 47]
    
    // Cycle Detection & Hierarchy Building [cite: 53, 54]
    const hierarchies = [];
    const processedNodes = new Set();

    function buildTree(node, visited = new Set()) {
        if (visited.has(node)) return { cycle: true };
        visited.add(node);
        processedNodes.add(node);
        
        let tree = {};
        let maxDepth = 1;
        let hasCycle = false;

        (adj[node] || []).forEach(child => {
            const res = buildTree(child, new Set(visited));
            if (res.cycle) hasCycle = true;
            else {
                tree[child] = res.tree;
                maxDepth = Math.max(maxDepth, 1 + res.depth);
            }
        });

        return { tree, depth: maxDepth, cycle: hasCycle };
    }

    roots.forEach(root => {
        const result = buildTree(root);
        if (result.cycle) {
            hierarchies.push({ root, tree: {}, has_cycle: true }); // [cite: 54, 55]
        } else {
            hierarchies.push({ root, tree: { [root]: result.tree }, depth: result.depth }); // [cite: 58]
        }
    });

    // Handle Pure Cycles (Lexicographically smallest node as root) [cite: 50]
    const remainingNodes = Array.from(nodes).filter(n => !processedNodes.has(n)).sort();
    if (remainingNodes.length > 0) {
        hierarchies.push({ root: remainingNodes[0], tree: {}, has_cycle: true });
    }

    // 3. Summary [cite: 31, 60]
    const validTrees = hierarchies.filter(h => !h.has_cycle);
    const summary = {
        total_trees: validTrees.length, // [cite: 63]
        total_cycles: hierarchies.length - validTrees.length,
        largest_tree_root: validTrees.sort((a,b) => b.depth - a.depth || a.root.localeCompare(b.root))[0]?.root || "" // [cite: 62]
    };

    res.json({
        user_id: "devanshsinhs_19072004", // [cite: 14, 34]
        email_id: "devansh.sinha1730@gmail.com",
        college_roll_number: "RA2311003030175",
        hierarchies,
        invalid_entries: invalidEntries,
        duplicate_edges: duplicateEdges,
        summary
    });
});

module.exports = router;