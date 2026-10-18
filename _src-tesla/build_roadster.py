# Blender (headless) build of the 2026 Tesla Roadster for the studio/tesla page.
# Run: blender -b -P build_roadster.py -- out.glb
# Car space (matches three.js page): x = left (driver, LHD), y = up, z = forward. Units metres.
# Blender space: X = x, Y = -z, Z = y. glTF export (+Y up) maps it back.
# Proportions traced from Tesla reveal stills (15 Oct 2026): wheelbase 2825 mm, width ~2000 mm,
# height ~1200 mm, front overhang ~800 mm, rear ~680 mm, tyres ~770 mm.
import bpy, bmesh, math, sys
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else '/tmp/roadster.glb'

WB = 2.825
ZF = WB / 2            # front axle z
def zd(d): return ZF - d   # d = metres behind front axle
WR = .36              # tyre radius
TRACK_F, TRACK_R = .845, .835   # wheel centre x (half track to tyre centreline)

def V(x, y, z): return Vector((x, -z, y))

# ---------------------------------------------------------------- materials
MAT = {}
def mat(name, col, metal=0., rough=.4, emit=None, alpha=1., strength=4):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*col, 1)
    b.inputs['Metallic'].default_value = metal
    b.inputs['Roughness'].default_value = rough
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = strength
    if alpha < 1:
        b.inputs['Alpha'].default_value = alpha
    MAT[name] = m; return m
def srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((v + .055) / 1.055) ** 2.4 if v > .04045 else v / 12.92 for v in c)
for n, c, me, r in [('Paint 1', '#e8e8e5', .1, .32), ('GlossBlack', '#060607', .2, .18), ('Carbon', '#111214', .3, .35),
                    ('Glass', '#0b0c0f', 0, .05), ('Underbody', '#050506', 0, .9), ('Headlight', '#dfe6f0', 0, .2),
                    ('Brakelight', '#a3100c', 0, .3), ('Signallight', '#c8701a', 0, .3), ('Chrome', '#d9dce0', 1, .15),
                    ('Tireside', '#0b0b0c', 0, .62), ('RimFace', '#3a3b3f', .6, .3), ('Rim1', '#0a0a0b', .5, .2),
                    ('Bronze', '#8a5a34', .9, .3), ('Barrel', '#1a1a1c', .8, .4), ('Disc', '#7d8085', 1, .45),
                    ('Caliper', '#1e2024', .6, .35), ('Interior 3', '#ecebe7', 0, .55), ('Interior Suede', '#2a2b2e', 0, .97),
                    ('Interior Black', '#0b0b0c', 0, .6), ('Ambient', '#ff2a22', 0, .5), ('Dashboard', '#05070a', 0, .2),
                    ('Liner', '#08080a', 0, .85), ('Plate', '#f2f2f0', 0, .5), ('Port', '#020203', 0, .6), ('Lens', '#0a0a0c', .1, .1)]:
    mat(n, srgb(c), me, r)

def set_mats(ob, names):
    ob.data.materials.clear()
    for n in names: ob.data.materials.append(MAT[n])

# ---------------------------------------------------------------- interpolation
def pchip(xs, ys):
    n = len(xs); h = [xs[i + 1] - xs[i] for i in range(n - 1)]; dl = [(ys[i + 1] - ys[i]) / h[i] for i in range(n - 1)]
    m = [0.] * n; m[0] = dl[0]; m[-1] = dl[-1]
    for i in range(1, n - 1):
        if dl[i - 1] * dl[i] <= 0: m[i] = 0
        else:
            w1 = 2 * h[i] + h[i - 1]; w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / dl[i - 1] + w2 / dl[i])
    def f(x):
        if x <= xs[0]: return ys[0]
        if x >= xs[-1]: return ys[-1]
        i = max(j for j in range(n - 1) if xs[j] <= x); t = (x - xs[i]) / h[i]
        t2, t3 = t * t, t * t * t
        return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h[i] * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h[i] * m[i + 1]
    return f
def table(rows):
    ds = [r[0] for r in rows]; cols = list(zip(*rows))[1:]
    fs = [pchip(ds, list(c)) for c in cols]
    return lambda d: [f(d) for f in fs]

# ---------------------------------------------------------------- body sections
# columns: d | yc (centre top) | xh,yh (hood/deck edge) | xc,yc2 (crest) | xs,ys (shoulder crease) | xw,yw (widest) | xl,yl (lower crease) | xb,yb (sill outer bottom) | ybot
BODY = table([
    [-0.8, 0.474, 0.38, 0.478, 0.62, 0.479, 0.76, 0.449, 0.79, 0.42, 0.79, 0.32, 0.74, 0.23, 0.22],
    [-0.76, 0.507, 0.4, 0.512, 0.68, 0.516, 0.82, 0.48, 0.85, 0.435, 0.85, 0.31, 0.79, 0.21, 0.2],
    [-0.68, 0.551, 0.4, 0.557, 0.74, 0.57, 0.88, 0.525, 0.91, 0.455, 0.905, 0.3, 0.84, 0.195, 0.19],
    [-0.5, 0.635, 0.4, 0.647, 0.79, 0.666, 0.935, 0.615, 0.965, 0.5, 0.955, 0.3, 0.885, 0.19, 0.185],
    [-0.25, 0.719, 0.41, 0.737, 0.83, 0.76, 0.975, 0.7, 0.995, 0.55, 0.985, 0.3, 0.915, 0.19, 0.185],
    [0.0, 0.752, 0.43, 0.773, 0.855, 0.803, 0.992, 0.735, 1.0, 0.58, 0.995, 0.3, 0.93, 0.195, 0.185],
    [0.15, 0.796, 0.5, 0.814, 0.86, 0.84, 0.99, 0.775, 0.998, 0.585, 0.99, 0.3, 0.925, 0.19, 0.18],
    [0.4, 0.814, 0.62, 0.836, 0.82, 0.861, 0.975, 0.8, 0.985, 0.57, 0.97, 0.3, 0.9, 0.18, 0.175],
    [0.8, 0.805, 0.64, 0.83, 0.8, 0.855, 0.955, 0.8, 0.962, 0.555, 0.945, 0.3, 0.875, 0.18, 0.175],
    [1.25, 0.83, 0.64, 0.85, 0.8, 0.878, 0.95, 0.82, 0.96, 0.56, 0.94, 0.3, 0.875, 0.18, 0.175],
    [1.7, 0.88, 0.66, 0.9, 0.81, 0.93, 0.968, 0.86, 0.978, 0.59, 0.96, 0.31, 0.89, 0.185, 0.175],
    [2.1, 0.96, 0.66, 0.98, 0.835, 1.0, 0.995, 0.91, 1.0, 0.62, 0.99, 0.32, 0.92, 0.195, 0.18],
    [2.42, 1.05, 0.3, 1.06, 0.7, 1.075, 0.998, 0.92, 1.0, 0.63, 0.995, 0.32, 0.935, 0.2, 0.185],
    [2.83, 0.98, 0.3, 0.985, 0.72, 1.015, 0.99, 0.9, 1.0, 0.6, 0.995, 0.32, 0.935, 0.21, 0.195],
    [3.2, 0.895, 0.3, 0.898, 0.76, 0.92, 0.96, 0.85, 0.957, 0.565, 0.945, 0.33, 0.91, 0.24, 0.22],
    [3.44, 0.86, 0.3, 0.861, 0.8, 0.87, 0.915, 0.83, 0.91, 0.538, 0.898, 0.33, 0.87, 0.26, 0.245],
    [3.47, 0.85, 0.3, 0.851, 0.8, 0.86, 0.905, 0.823, 0.9, 0.533, 0.888, 0.33, 0.86, 0.265, 0.25],
])
D0, D1 = -.80, 3.47
# segment bulge (fraction of chord, outward) per band 0..6
BULGE = [.02, .015, .025, .05, .03, .015, 0]
SEG_N = [10, 7, 6, 10, 10, 3, 6]

def cr_point(p0, p1, p2, p3, t, alpha=.5):
    p0, p1, p2, p3 = map(Vector, (p0, p1, p2, p3))
    def tj(ti, a, b): return ti + max((b - a).length, 1e-6) ** alpha
    t0 = 0; t1 = tj(t0, p0, p1); t2 = tj(t1, p1, p2); t3 = tj(t2, p2, p3)
    tt = t1 + (t2 - t1) * t
    A1 = (t1 - tt) / (t1 - t0) * p0 + (tt - t0) / (t1 - t0) * p1
    A2 = (t2 - tt) / (t2 - t1) * p1 + (tt - t1) / (t2 - t1) * p2
    A3 = (t3 - tt) / (t3 - t2) * p2 + (tt - t2) / (t3 - t2) * p3
    B1 = (t2 - tt) / (t2 - t0) * A1 + (tt - t0) / (t2 - t0) * A2
    B2 = (t3 - tt) / (t3 - t1) * A2 + (tt - t1) / (t3 - t1) * A3
    return (t2 - tt) / (t2 - t1) * B1 + (tt - t1) / (t2 - t1) * B2
def cr_chain(P, counts, pre, post):
    """sample Catmull-Rom through P (P[0]..P[-1]) with given samples per span; pre/post are ghost points."""
    Q = [pre] + P + [post]; out = []; spans = []
    for i in range(len(P) - 1):
        n = counts[i]
        for k in range(n):
            v = cr_point(Q[i], Q[i + 1], Q[i + 2], Q[i + 3], k / n); out.append((v.x, v.y)); spans.append(i)
    return out, spans
BLK = pchip([-.80, -.55, 0, 1.2, 2.2, 2.6, 3.0, 3.47], [.40, .33, .30, .31, .35, .41, .46, .48])
def body_section(d):
    yc, xh, yh, xc, yc2, xs, ys, xw, yw, xl, yl, xb, yb, ybot = BODY(d)
    top = [(0, yc), (xh, yh), (xc, yc2), (xs, ys), (xw, yw), (xl, yl)]
    post = (xl - .02, yl - .12)
    pts, band = cr_chain(top, SEG_N[:5], (-xh, yh), post)
    # black sill band (straight), then flat bottom back to centre
    for k in range(SEG_N[5]):
        t = k / SEG_N[5]; pts.append((xl + (xb - xl) * t, yl + (yb - yl) * t)); band.append(5)
    for k in range(SEG_N[6]):
        t = k / SEG_N[6]; pts.append((xb * (1 - t), yb + (ybot - yb) * t)); band.append(6)
    pts.append((0, ybot)); band.append(6)
    # two-tone split: insert one vertex where the outer side crosses BLK(d); everything below is black
    yk = BLK(d); iw = max(range(len(pts) - 1), key=lambda i: pts[i][0])
    for i in range(iw, len(pts) - 1):
        if pts[i][1] >= yk > pts[i + 1][1]:
            t = (pts[i][1] - yk) / (pts[i][1] - pts[i + 1][1])
            q = (pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, yk)
            pts.insert(i + 1, q); band.insert(i + 1, 5)
            for j in range(i + 1, len(band)):
                if band[j] < 5: band[j] = 5
            break
    else:
        pts.insert(len(pts) - 1, pts[-2]); band.insert(len(band) - 1, 6)
    return pts, band

def stations(d0, d1, step=.025, extra=()):
    n = max(2, int(round((d1 - d0) / step)))
    s = sorted(set([round(d0 + (d1 - d0) * i / n, 5) for i in range(n + 1)] + [e for e in extra if d0 <= e <= d1]))
    return s

BAND_MAT = ['Paint 1', 'GlossBlack', 'Underbody']

def loft_closed(name, ds, secfn, matfn, cap0=True, cap1=True, mats=None):
    """loft full (mirrored) closed sections along d. secfn(d)->(pts_left_half, band) from top centre to bottom centre."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    rings = []
    for d in ds:
        pts, band = secfn(d)
        # full ring: left half top->bottom, then right half bottom->top (excluding duplicates of centre points)
        full = [(x, y, b) for (x, y), b in zip(pts, band)]
        right = [(-x, y, b) for (x, y), b in zip(pts[1:-1], band[1:-1])][::-1]
        ring = full + right
        rings.append([(bm.verts.new(V(x, y, zd(d))), b) for x, y, b in ring])
    bm.verts.ensure_lookup_table()
    names = mats or BAND_MAT
    n = len(rings[0])
    for r in range(len(rings) - 1):
        A, B = rings[r], rings[r + 1]
        for i in range(n):
            j = (i + 1) % n
            # band of this edge: left half uses band of i; right half uses band of j
            bi = A[i][1] if i < len(rings[0]) // 2 + 1 else A[j][1]
            if OPEN_BOTTOM and bi == 6: continue
            try:
                f = bm.faces.new((A[i][0], A[j][0], B[j][0], B[i][0]))
                f.material_index = matfn(bi, ds[r])
            except ValueError: pass
    for cap, ring, mi in ((cap0, rings[0], 1), (cap1, rings[-1], 0)):
        if cap:
            vs = [v for v, _ in ring]; c = bm.verts.new(sum((v.co for v in vs), Vector()) / len(vs))
            for i in range(len(vs)):
                try: f = bm.faces.new((vs[i], vs[(i + 1) % len(vs)], c)); f.material_index = mi
                except ValueError: pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
    set_mats(ob, names)
    return ob

OPEN_BOTTOM = False
def body_mat(b, d): return 0 if b < 5 else (1 if b == 5 else 2)

# ---------------------------------------------------------------- canopy (glass house)
# columns: d | xb,yb (base on the belt) | xu,yu (upper side glass) | xr,yr (roof edge) | ytop (centre)
CAN = table([
    [0.0, 0.7, 0.79, 0.62, 0.74, 0.529, 0.722, 0.721],
    [0.08, 0.76, 0.817, 0.66, 0.777, 0.552, 0.766, 0.767],
    [0.3, 0.79, 0.85, 0.7, 0.848, 0.575, 0.882, 0.888],
    [0.7, 0.785, 0.852, 0.67, 0.96, 0.546, 1.039, 1.045],
    [1.2, 0.785, 0.87, 0.63, 1.06, 0.512, 1.155, 1.163],
    [1.7, 0.79, 0.918, 0.6, 1.083, 0.483, 1.158, 1.165],
    [2.1, 0.74, 0.993, 0.52, 1.088, 0.46, 1.13, 1.136],
    [2.3, 0.56, 1.03, 0.42, 1.06, 0.395, 1.092, 1.096],
    [2.42, 0.3, 1.08, 0.3, 1.065, 0.275, 1.079, 1.08],
])
def canopy_section(d):
    xb, yb, xu, yu, xr, yr, yt = CAN(d)
    P = [(0, yt), (xr, yr), (xu, yu), (xb, yb)]
    pts, band = cr_chain(P, [8, 7, 5], (-xr, yr), (xb + .02, yb - .1))
    pts.append(P[-1]); band.append(2)
    return pts, band

def loft_open(name, ds, secfn, mats, thick=0.):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); rings = []
    for d in ds:
        pts, band = secfn(d)
        half = [(x, y) for x, y in pts]
        ring = [(-x, y) for x, y in half[::-1]] + half[1:]   # right base -> top centre -> left base
        rings.append([bm.verts.new(V(x, y, zd(d))) for x, y in ring])
    for r in range(len(rings) - 1):
        A, B = rings[r], rings[r + 1]
        for i in range(len(A) - 1):
            try: bm.faces.new((A[i], A[i + 1], B[i + 1], B[i]))
            except ValueError: pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob); set_mats(ob, mats)
    if thick:
        m = ob.modifiers.new('sol', 'SOLIDIFY'); m.thickness = thick; m.offset = -1
    return ob

# ---------------------------------------------------------------- helpers
def apply_all(ob):
    bpy.context.view_layer.objects.active = ob
    for m in list(ob.modifiers):
        bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True)
        bpy.ops.object.modifier_apply(modifier=m.name)

def boolean(ob, cutter, op='DIFFERENCE'):
    _n0 = len(ob.data.vertices)
    m = ob.modifiers.new('b', 'BOOLEAN'); m.operation = op; m.object = cutter; m.solver = 'EXACT'
    try: m.use_hole_tolerant = True
    except Exception: pass
    try: m.material_mode = 'TRANSFER'
    except Exception: pass
    apply_all(ob)
    print('BOOL', ob.name, cutter.name, op, _n0, '->', len(ob.data.vertices))

def prism(name, poly_dy, x0, x1, mats=('Liner',)):
    """extrude a side-view polygon [(d,y)...] across x0..x1."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    a = [bm.verts.new(V(x0, y, zd(d))) for d, y in poly_dy]
    b = [bm.verts.new(V(x1, y, zd(d))) for d, y in poly_dy]
    bm.faces.new(a); bm.faces.new(b[::-1])
    n = len(a)
    for i in range(n):
        j = (i + 1) % n; bm.faces.new((a[i], a[j], b[j], b[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob); set_mats(ob, mats); return ob

def cyl_x(name, d, y, r, x0, x1, seg=64, mats=('Liner',)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=abs(x1 - x0), location=V((x0 + x1) / 2, y, zd(d)), rotation=(0, math.pi / 2, 0))
    ob = bpy.context.active_object; ob.name = name; set_mats(ob, mats); return ob

def box(name, c, s, mats=('GlossBlack',), rot=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=V(*c))
    ob = bpy.context.active_object; ob.name = name; ob.scale = (s[0], s[2], s[1])
    if rot: ob.rotation_euler = rot
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    set_mats(ob, mats); return ob

def remove(ob): bpy.data.objects.remove(ob, do_unlink=True)

def mirror_x(ob):
    m = ob.modifiers.new('mir', 'MIRROR'); m.use_axis = (True, False, False); m.use_mirror_merge = False

def dup(ob, name):
    o2 = ob.copy(); o2.data = ob.data.copy(); o2.name = name; bpy.context.collection.objects.link(o2); return o2

def smooth(ob, ang=32):
    bpy.context.view_layer.objects.active = ob; bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True)
    try: bpy.ops.object.shade_smooth_by_angle(angle=math.radians(ang))
    except Exception:
        bpy.ops.object.shade_smooth()

def set_origin(ob, p):
    """move object origin to car-space point p (keeps geometry in place)."""
    w = V(*p); ob.data.transform(Matrix.Translation(-(w - ob.location))); ob.location = w

# ---------------------------------------------------------------- build
bpy.ops.wm.read_factory_settings(use_empty=True)
# re-create materials after factory reset
MAT.clear()
for n, c, me, r in [('Paint 1', '#e8e8e5', .1, .32), ('GlossBlack', '#060607', .2, .18), ('Carbon', '#111214', .3, .35),
                    ('Glass', '#0b0c0f', 0, .05), ('Underbody', '#050506', 0, .9), ('Headlight', '#dfe6f0', 0, .2),
                    ('Brakelight', '#a3100c', 0, .3), ('Signallight', '#c8701a', 0, .3), ('Chrome', '#d9dce0', 1, .15),
                    ('Tireside', '#0b0b0c', 0, .62), ('RimFace', '#3a3b3f', .6, .3), ('Rim1', '#0a0a0b', .5, .2),
                    ('Bronze', '#8a5a34', .9, .3), ('Barrel', '#1a1a1c', .8, .4), ('Disc', '#7d8085', 1, .45),
                    ('Caliper', '#1e2024', .6, .35), ('Interior 3', '#ecebe7', 0, .55), ('Interior Suede', '#2a2b2e', 0, .97),
                    ('Interior Black', '#0b0b0c', 0, .6), ('Ambient', '#ff2a22', 0, .5), ('Dashboard', '#05070a', 0, .2),
                    ('Liner', '#08080a', 0, .85), ('Plate', '#f2f2f0', 0, .5), ('Port', '#020203', 0, .6), ('Lens', '#0a0a0c', .1, .1)]:
    mat(n, srgb(c), me, r)
mat('Headlight', srgb('#2a2e35'), 0, .15, emit=srgb('#eef3ff'))
mat('Brakelight', srgb('#4a0a08'), 0, .2, emit=srgb('#e00800'), strength=.7)
mat('Signallight', srgb('#ff8a1a'), 0, .3, emit=srgb('#ff8a1a'))
mat('Ambient', srgb('#ff2a22'), 0, .5, emit=srgb('#ff2a22'))

root = bpy.data.objects.new('Roadster', None); bpy.context.collection.objects.link(root)
def parent(ob, p=None): ob.parent = p or root; return ob

DS = stations(D0, D1, .022, extra=[-.76, -.68, 0, .15, .4, .8, 1.25, 1.7, 2.1, 2.42, 2.83, 3.2, 3.46])
body = loft_closed('Body', DS, body_section, body_mat)


# two-tone: everything below this line (per station) is gloss black, like the real car

# cabin cavity (open tub under the canopy)
cav = prism('cavCut', [(.06, .30), (.06, 1.4), (2.36, 1.4), (2.36, .30)], -.76, .76, mats=('Interior Black',))
# shape the cavity front so it follows the cowl
boolean(body, cav); remove(cav)

# wheel arches: cylinders cut from the flank inward to x=.48
for dW in (0, WB):
    for sg in (1, -1):
        c = cyl_x('arch', dW, WR, .425, sg * .47, sg * 1.3, mats=('Liner',)); boolean(body, c); remove(c)

# side intake slit behind the front wheel (blade, tapering forward)
for sg in (1, -1):
    c = prism('intake', [(.30, .545), (.66, .515), (.66, .585), (.40, .575)], sg * .90, sg * 1.2, mats=('Lens',)); boolean(body, c); remove(c)

# ---- panels: split by bisecting along straight shut lines, then separating faces (no booleans on shells)
GAP = .0035
def pip(pt, poly):
    x, y = pt; inside = False; n = len(poly)
    for i in range(n):
        x1, y1 = poly[i]; x2, y2 = poly[(i + 1) % n]
        if (y1 > y) != (y2 > y) and x < x1 + (y - y1) * (x2 - x1) / (y2 - y1): inside = not inside
    return inside
def offset_poly(poly, g):
    n = len(poly); out = []
    area = sum(poly[i][0] * poly[(i + 1) % n][1] - poly[(i + 1) % n][0] * poly[i][1] for i in range(n))
    sgn = 1 if area > 0 else -1
    for i in range(n):
        p0, p1, p2 = Vector(poly[i - 1]), Vector(poly[i]), Vector(poly[(i + 1) % n])
        e1 = (p1 - p0).normalized(); e2 = (p2 - p1).normalized()
        n1 = Vector((e1.y, -e1.x)) * sgn; n2 = Vector((e2.y, -e2.x)) * sgn
        m = n1 + n2; m = m / max(m.dot(n1), .3)
        out.append(tuple(p1 + m * g))
    return out
def dy_of(v): return (ZF - (-v.co.y), v.co.z)   # blender vert -> (d, y)
def bisect_poly(bm, poly):
    for i in range(len(poly)):
        (d0, y0), (d1, y1) = poly[i], poly[(i + 1) % len(poly)]
        a = V(0, y0, zd(d0)); b = V(0, y1, zd(d1)); t = (b - a).normalized()
        no = Vector((0, -t.z, t.y)) if False else Vector((0, t.z, -t.y))   # perpendicular in the Y-Z plane
        geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
        bmesh.ops.bisect_plane(bm, geom=geom, plane_co=a, plane_no=no, clear_inner=False, clear_outer=False)
def bisect_x(bm, x):
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=Vector((x, 0, 0)), plane_no=Vector((1, 0, 0)))
def fdy(f):
    c = f.calc_center_median(); return (ZF + c.y, c.z), c
def separate(src, name, poly, sel, gap=GAP, bis_x=()):
    """split faces of src inside side-view polygon `poly` (and sel(center, normal)) into a new object; delete a gap band."""
    inner = offset_poly(poly, -gap / 2); outer = offset_poly(poly, gap / 2)
    bm = bmesh.new(); bm.from_mesh(src.data)
    for x in bis_x: bisect_x(bm, x)
    bisect_poly(bm, inner); bisect_poly(bm, outer)
    take, band = [], []
    for f in bm.faces:
        q, c = fdy(f)
        if not sel(c, f.normal): continue
        if pip(q, inner): take.append(f)
        elif pip(q, outer): band.append(f)
    # new mesh from taken faces
    bm2 = bm.copy()
    keep_idx = set(f.index for f in take)
    bm.faces.ensure_lookup_table(); bm2.faces.ensure_lookup_table()
    bmesh.ops.delete(bm2, geom=[f for f in bm2.faces if f.index not in keep_idx], context='FACES')
    bmesh.ops.delete(bm, geom=take + band, context='FACES')
    bm.to_mesh(src.data); bm.free()
    me = bpy.data.meshes.new(name); bm2.to_mesh(me); bm2.free()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
    for m in src.data.materials: ob.data.materials.append(m)
    return ob

DOOR_POLY = [(.64, .26), (.56, .50), (.60, .70), (.70, .86), (1.10, 1.40), (1.95, 1.40), (1.84, .86), (1.66, .26)]
HOOD_POLY = [(-.68, .3), (-.68, 1.2), (-.04, 1.2), (-.04, .3)]
DECK_POLY = [(2.48, .3), (2.48, 1.3), (3.12, 1.3), (3.12, .3)]

def up_and(xmax):
    return lambda c, n: abs(c.x) < xmax and n.z > .55
hood = separate(body, 'BodyHoodPanel', HOOD_POLY, up_and(.43), bis_x=(-.43, .43))
deck = separate(body, 'BodyDeck', DECK_POLY, up_and(.58), bis_x=(-.58, .58))
# the bisect_x lines leave open seams on the body; widen them into gaps
def x_gap(src, xs, poly, g=GAP):
    bm = bmesh.new(); bm.from_mesh(src.data)
    for x in xs: bisect_x(bm, x - g); bisect_x(bm, x + g)
    kill = []
    for f in bm.faces:
        q, c = fdy(f)
        if f.normal.z > .55 and pip(q, poly) and any(abs(c.x - x) < g for x in xs): kill.append(f)
    bmesh.ops.delete(bm, geom=kill, context='FACES'); bm.to_mesh(src.data); bm.free()
x_gap(body, (-.43, .43), offset_poly(HOOD_POLY, GAP)); x_gap(body, (-.58, .58), offset_poly(DECK_POLY, GAP))

canopy = loft_open('Canopy', stations(0, 2.42, .02, extra=[.08, .3, .7, 1.2, 1.7, 2.1, 2.3]), canopy_section, ['Glass'])

doors = {}
for sg, nm in ((1, 'BodyDoorLColor1'), (-1, 'BodyDoorRColor1')):
    skin = separate(body, nm + 'Skin', DOOR_POLY, lambda c, n, sg=sg: c.x * sg > .5 and n.x * sg > -.2)
    glass = separate(canopy, nm + 'Glass', DOOR_POLY, lambda c, n, sg=sg: c.x * sg > .30 and n.x * sg > .05, gap=.006)
    doors[nm] = (skin, glass)

def separate_d(src, name, d0, d1, xw=9, sel=None):
    poly = [(d0, -1), (d0, 3), (d1, 3), (d1, -1)]
    return separate(src, name, poly, sel or (lambda c, n: abs(c.x) < xw), gap=.006)
wind = separate_d(canopy, 'BodyWindshield', -.2, .96, sel=lambda c, n: n.z > .25 or abs(c.x) < .5)
roof = separate_d(canopy, 'BodyRoofPanel', .96, 1.98, sel=lambda c, n: n.z > .5)
canopy.name = 'BodyRearwindow'

# ---- thickness, normals, cabin tub, arch liners, underbody
def orient_out(ob, ref=None):
    me = ob.data; bm = bmesh.new(); bm.from_mesh(me)
    c = ref or V(0, .55, zd(1.25))
    for f in bm.faces:
        if (f.calc_center_median() - c).dot(f.normal) < 0: f.normal_flip()
    bm.to_mesh(me); bm.free()
def thicken(ob, t=.004):
    m = ob.modifiers.new('sol', 'SOLIDIFY'); m.thickness = t; m.offset = -1; m.use_rim = True
    try: m.material_offset_rim = 0
    except Exception: pass
    apply_all(ob)
for o in [hood, deck] + [doors[k][0] for k in doors]:
    thicken(o, .005)
# open the cabin wall behind each door so the interior shows when the doors lift
bm = bmesh.new(); bm.from_mesh(body.data)
kill = [f for f in bm.faces if abs(abs(f.calc_center_median().x) - .76) < .01 and f.normal.x * f.calc_center_median().x < -.5 and pip(fdy(f)[0], DOOR_POLY)]
bmesh.ops.delete(bm, geom=kill, context='FACES'); bm.to_mesh(body.data); bm.free()
for o in [canopy, roof, wind] + [doors[k][1] for k in doors]:
    orient_out(o); thicken(o, .004)
# cabin tub (open top) under the canopy
tub = []
tub.append(box('InteriorTubFloor', (0, .215, zd(1.2)), (1.50, .02, 2.30), ('Interior Suede',)))
tub.append(box('InteriorFirewall', (0, .45, zd(.07)), (1.50, .48, .02), ('Interior Black',)))
tub.append(box('InteriorBulkhead', (0, .55, zd(2.34)), (1.50, .70, .02), ('Interior Black',)))
for sg in (1, -1):
    tub.append(box('InteriorSill', (sg * .74, .48, zd(1.2)), (.03, .52, 2.30), ('Interior Black',)))
    tub.append(box('InteriorDoorCard', (sg * .80, .62, zd(1.18)), (.02, .32, .95), ('Interior 3',)))
# arch liners (upper half cylinders) and underbody plate
def liner(dW, sg):
    me = bpy.data.meshes.new('ArchLiner'); bm = bmesh.new(); seg = 40; R = .42
    rows = []
    for k in range(seg + 1):
        a = math.radians(-25 + 230 * k / seg)
        zz, yy = zd(dW) + R * math.cos(a), WR + R * math.sin(a)
        rows.append((bm.verts.new(V(sg * .47, yy, zz)), bm.verts.new(V(sg * .98, yy, zz))))
    for a, b in zip(rows, rows[1:]): bm.faces.new((a[0], a[1], b[1], b[0]))
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new('ArchLiner', me); bpy.context.collection.objects.link(ob); set_mats(ob, ['Liner']); return ob
liners = [liner(dW, sg) for dW in (0, WB) for sg in (1, -1)]
for dW in (0, WB):
    for sg in (1, -1):
        liners.append(cyl_x('ArchWall', dW, WR, .425, sg * .46, sg * .47, mats=('Liner',)))
ub = box('Underbody', (0, .148, zd(1.35)), (1.70, .01, 4.1), ('Underbody',))

# ---------------------------------------------------------------- lights & trim
# front LED strip along the nose top edge (slight V, sags at the centre)
def ribbon(name, pts, h, depth, matn):
    """thin bar following a polyline of car-space points, height h (vertical), depth (along -normal)."""
    me = bpy.data.meshes.new(name); bm = bmesh.new(); rows = []
    for x, y, z in pts:
        rows.append([bm.verts.new(V(x, y + h / 2, z)), bm.verts.new(V(x, y - h / 2, z)),
                     bm.verts.new(V(x, y - h / 2, z - depth)), bm.verts.new(V(x, y + h / 2, z - depth))])
    for a, b in zip(rows, rows[1:]):
        for i in range(4):
            j = (i + 1) % 4; bm.faces.new((a[i], a[j], b[j], b[i]))
    bm.faces.new(rows[0]); bm.faces.new(rows[-1][::-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob); set_mats(ob, [matn]); return ob

def nose_front_z(x):
    return zd(-.80)
# light strip
lp = [(x, .405 + .012 * (abs(x) / .76) ** 2, nose_front_z(x) + .014) for x in [i / 40 * 1.40 - .70 for i in range(41)]]
head = ribbon('Headlights', lp, .02, .03, 'Headlight')
ribbon('HeadHousing', [(x, y, z - .006) for x, y, z in lp], .045, .03, 'GlossBlack')
# corner slit lamps
def surf_pt(d, frac):
    # point on the upper body surface at station d between hood edge (frac 0) and crest (1)
    v = BODY(d); xh, yh, xc, yc2 = v[1], v[2], v[3], v[4]
    return (xh + (xc - xh) * frac, yh + (yc2 - yh) * frac + .004, zd(d))
for sg in (1, -1):
    pts = []
    for i in range(13):
        t = i / 12; d = -.79 + .52 * t; fr = .15 + .75 * t
        x, y, z = surf_pt(d, fr); pts.append((sg * x, y, z))
    blade = ribbon('HeadBlade', pts, .03, .006, 'Headlight')
# lower front black (intake band) and splitter
fl = [(x, .29, nose_front_z(x) + .002) for x in [i / 30 * 1.3 - .65 for i in range(31)]]
pass  # real car has no open mouth
spl = [(x, .175, nose_front_z(x) + .025) for x in [i / 30 * 1.44 - .72 for i in range(31)]]
ribbon('Splitter', spl, .02, .25, 'Carbon')

# rear: light bar under the wing lip, black lower fascia with 4 thruster ports, plate
TAILZ = zd(D1)
ribbon('Taillight', [(x, .79, TAILZ + .004) for x in [i / 40 * 1.76 - .88 for i in range(41)]], .028, .03, 'Brakelight')
ribbon('TailLens', [(x, .775, TAILZ + .003) for x in [i / 40 * 1.76 - .88 for i in range(41)]], .022, .02, 'Lens')
fas = box('RearFascia', (0, .47, TAILZ - .005), (1.72, .56, .06), ('GlossBlack',))
ports = []
for x in (-.38, -.125, .125, .38):
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=.045, depth=.12, location=V(x, .30, TAILZ - .02), rotation=(math.pi / 2, 0, 0))
    c = bpy.context.active_object; set_mats(c, ['Port']); boolean(fas, c); remove(c)
    bpy.ops.mesh.primitive_torus_add(major_radius=.047, minor_radius=.006, major_segments=40, minor_segments=10, location=V(x, .30, TAILZ - .038), rotation=(math.pi / 2, 0, 0))
    t = bpy.context.active_object; t.name = 'ThrusterRing'; set_mats(t, ['Disc']); ports.append(t)
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=.044, depth=.01, location=V(x, .30, TAILZ - .012), rotation=(math.pi / 2, 0, 0))
    b = bpy.context.active_object; b.name = 'ThrusterBore'; set_mats(b, ['Port']); ports.append(b)
# diffuser fins
plate = box('Plate', (0, .56, TAILZ - .038), (.31, .155, .006), ('Plate',))

# wing: full-width thin blade forming the trailing edge of the deck, tips flicked
def wing():
    me = bpy.data.meshes.new('BodyWing'); bm = bmesh.new(); rows = []
    for i in range(41):
        x = -.99 + 1.98 * i / 40; ax = abs(x)
        flick = .02 * max(0, (ax - .78) / .21) ** 2
        y = .875 + flick + .025 * max(0, 1 - ax / .5)   # creased centre hump
        zf, zr = zd(3.05), TAILZ - .09
        rows.append([bm.verts.new(V(x, y + .016, zf)), bm.verts.new(V(x, y + .012, zr)), bm.verts.new(V(x, y - .02, zr)), bm.verts.new(V(x, y - .03, zf + .06))])
    for a, b in zip(rows, rows[1:]):
        for i in range(4):
            j = (i + 1) % 4; bm.faces.new((a[i], a[j], b[j], b[i]))
    bm.faces.new(rows[0]); bm.faces.new(rows[-1][::-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new('BodyWing', me); bpy.context.collection.objects.link(ob); set_mats(ob, ['Paint 1']); return ob
wg = wing()
for sg in (1, -1):   # endplates hanging down at the wing tips
    ep = prism('WingEndplate', [(3.02, .91), (3.47 + .09, .91), (3.47 + .09, .78), (3.25, .70), (3.02, .80)], sg * .955, sg * .985, mats=('GlossBlack',))
wg.data.materials.clear(); wg.data.materials.append(MAT['GlossBlack'])

# amber side markers at the back of the intake

# ---------------------------------------------------------------- wheels
def revolve(name, prof, seg, matn):
    """profile [(r, x)] revolved about the X axis (car x = axle)."""
    me = bpy.data.meshes.new(name); bm = bmesh.new(); rings = []
    for k in range(seg):
        a = 2 * math.pi * k / seg
        rings.append([bm.verts.new(Vector((x, r * math.cos(a), r * math.sin(a)))) for r, x in prof])
    for k in range(seg):
        A, B = rings[k], rings[(k + 1) % seg]
        for i in range(len(prof) - 1):
            try: bm.faces.new((A[i], A[i + 1], B[i + 1], B[i]))
            except ValueError: pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob); set_mats(ob, [matn]); return ob

def make_wheel(name, d, sg, tw):
    g = bpy.data.objects.new(name, None); bpy.context.collection.objects.link(g); g.parent = root
    cx = sg * (TRACK_F if d == 0 else TRACK_R)
    g.location = V(cx, WR, zd(d))
    R, RR = WR, .272   # tyre, rim
    hw = tw / 2; o = sg  # outward sign
    # tyre profile from inner bead -> tread -> outer bead (x local, outward = +o)
    prof = [(RR + .005, -o * hw * .86), (RR + .045, -o * hw * .98), (R - .03, -o * hw), (R - .006, -o * hw * .93), (R, -o * hw * .7),
            (R, o * hw * .7), (R - .006, o * hw * .93), (R - .03, o * hw), (RR + .045, o * hw * .98), (RR + .005, o * hw * .86)]
    if o < 0: prof = prof[::-1]
    ty = revolve(name + 'Tyre', prof, 96, 'Tireside'); ty.parent = g
    rim = bpy.data.objects.new(name + 'Rim', None); bpy.context.collection.objects.link(rim); rim.parent = g
    # barrel + lip
    bp = [(RR + .006, o * hw * .86), (RR - .004, o * hw * .9), (RR - .016, o * hw * .84), (RR - .02, -o * hw * .8), (RR - .004, -o * hw * .86)]
    b = revolve(name + 'Barrel', bp, 96, 'Rim1'); b.parent = rim
    # aero disc face (body colour), slightly dished
    face_x = o * (hw * .80)
    dp = [(RR - .016, face_x), (.20, face_x - o * .010), (.10, face_x - o * .022), (.05, face_x - o * .025), (.0, face_x - o * .025)]
    df = revolve(name + 'Face', dp, 96, 'RimFace'); df.parent = rim
    # six faceted gloss-black blade spokes tapering to points near the rim
    me = bpy.data.meshes.new(name + 'Spokes'); bm = bmesh.new()
    for k in range(6):
        a0 = 2 * math.pi * k / 6 + math.pi / 6
        def P(r, da, h):
            a = a0 + da
            return Vector((face_x + o * h - o * .022 * (1 - r / RR), r * math.cos(a), r * math.sin(a)))
        r0, r1 = .055, RR - .022
        w0 = .045
        v = [P(r0, -w0 / r0 * .9, .004), P(r0, 0, .022), P(r0, w0 / r0 * .9, .004),
             P(r1, -.004 / r1, .003), P(r1, 0, .010), P(r1, .004 / r1, .003),
             P(r0, -w0 / r0 * .9, -.01), P(r0, w0 / r0 * .9, -.01), P(r1, 0, -.004)]
        V_ = [bm.verts.new(p) for p in v]
        for f in [(0, 1, 4, 3), (1, 2, 5, 4), (0, 3, 8, 6), (2, 7, 8, 5), (0, 6, 7, 2, 1), (3, 4, 5, 8)]:
            try: bm.faces.new([V_[i] for i in f])
            except ValueError: pass
        # bronze triangular insert between this spoke and the next, near the rim
        am = a0 + math.pi / 6
        tri = [Vector((face_x + o * .006, r * math.cos(am + da), r * math.sin(am + da))) for r, da in [(RR - .03, -.17), (RR - .03, .17), (RR - .085, 0)]]
        T = [bm.verts.new(p) for p in tri]; bm.faces.new(T if o > 0 else T[::-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    sp = bpy.data.objects.new(name + 'Spokes', me); bpy.context.collection.objects.link(sp); sp.parent = rim
    # material slots: spokes black, inserts bronze -> assign per face by area (inserts are triangles)
    set_mats(sp, ['Rim1', 'Bronze'])
    for f in sp.data.polygons:
        if len(f.vertices) == 3: f.material_index = 1
    # centre cap
    cp = [(.052, face_x + o * .002), (.045, face_x + o * .014), (.0, face_x + o * .018)]
    cc = revolve(name + 'Cap', cp, 48, 'GlossBlack'); cc.parent = rim
    # brake disc + caliper (hidden behind the aero face, shown in the exploded view)
    dsk = revolve(name + 'BrakeDisc', [(.12, -o * .04), (.205, -o * .04), (.205, -o * .01), (.12, -o * .01)], 64, 'Disc'); dsk.parent = g
    cal = box(name + 'BrakePad', (0, 0, 0), (.05, .07, .16), ('Caliper',)); cal.parent = g
    cal.location = Vector((-o * .02, .06 if d else -.06, .14)); cal.scale = (1, 1, 1)
    return g

wheels = [make_wheel('WheelFrontL', 0, 1, .265), make_wheel('WheelFrontR', 0, -1, .265),
          make_wheel('WheelRearL', WB, 1, .325), make_wheel('WheelRearR', WB, -1, .325)]

# ---------------------------------------------------------------- interior
def seat(name, sx):
    objs = []
    # cushion, backrest (raked), headrest, bolsters: white leather with black frame
    objs.append(box(name + 'Cushion', (sx, .30, zd(1.30)), (.46, .08, .50), ('Interior 3',)))
    br = box(name + 'Back', (sx, .62, zd(1.62)), (.46, .62, .09), ('Interior 3',), rot=(math.radians(-24), 0, 0))
    objs.append(br)
    objs.append(box(name + 'Head', (sx, .99, zd(1.80)), (.26, .18, .08), ('Interior 3',), rot=(math.radians(-24), 0, 0)))
    for b in (-1, 1):
        objs.append(box(name + 'Bol', (sx + b * .21, .64, zd(1.60)), (.07, .55, .12), ('Interior Black',), rot=(math.radians(-24), 0, 0)))
    objs.append(box(name + 'Frame', (sx, .24, zd(1.32)), (.48, .05, .54), ('Interior Black',)))
    return objs
seats1 = seat('SeatL', .38); seats2 = seat('SeatR', -.38)
tunnel = box('Tunnel', (0, .30, zd(1.0)), (.20, .14, 1.30), ('Interior Black',))
dash = box('Dash', (0, .66, zd(.40)), (1.50, .18, .30), ('Interior Black',))
screen = box('Screen', (0, .80, zd(.52)), (.36, .20, .012), ('Dashboard',), rot=(math.radians(-14), 0, 0))
# yoke in front of the driver (left seat)
yk = bpy.data.objects.new('Yoke', None); bpy.context.collection.objects.link(yk)
yk.location = V(.38, .70, zd(.78)); yk.rotation_euler = (math.radians(-22), 0, 0)
ybar = box('YokeBar', (0, 0, 0), (.30, .03, .035), ('Interior Black',)); ybar.parent = yk
for b in (-1, 1):
    gr = box('YokeGrip', (b * .15, -.05, 0), (.04, .14, .04), ('Interior Suede',)); gr.parent = yk
hubb = box('YokeHub', (0, -.01, 0), (.10, .07, .04), ('Interior Black',)); hubb.parent = yk
col = box('YokeCol', (.38, .66, zd(.62)), (.05, .05, .30), ('Interior Black',), rot=(math.radians(-22), 0, 0))
floor = box('CabinFloor', (0, .23, zd(1.2)), (1.55, .02, 2.2), ('Interior Suede',))
amb = []
for sg in (1, -1):
    amb.append(ribbon('AmbientStrip', [(sg * .74, .70, zd(d)) for d in [.5, 1.0, 1.5, 1.85]], .006, .006, 'Ambient'))
amb.append(ribbon('AmbientDash', [(x, .575, zd(.26)) for x in [-.7, 0, .7]], .006, .01, 'Ambient'))

# ---------------------------------------------------------------- assemble hierarchy with pivots
def group(name, pivot, kids):
    g = bpy.data.objects.new(name, None); bpy.context.collection.objects.link(g); g.parent = root; g.location = V(*pivot)
    bpy.context.view_layer.update()
    for k in kids:
        mw = k.matrix_world.copy(); k.parent = g; k.matrix_world = mw
    return g


# door pivots: hinge at the front top of the door (scissor, rotates about lateral axis)
for nm, (sk, gl) in doors.items():
    sg = 1 if nm.endswith('LColor1') else -1
    for o in (sk, gl): smooth(o)
    group(nm, (sg * .80, .86, zd(.62)), [sk, gl])
group('BodyHood', (0, .80, zd(-.02)), [hood]); smooth(hood)
group('BodyRearPanelsColor1', (0, 1.09, zd(2.44)), [deck]); smooth(deck)
deck.name = 'BodyDeck'; hood.name = 'BodyHoodPanel'
for o in (body, canopy, roof, wind): smooth(o, 24)
body.name = 'BodyPanelsColor1'
for o in [body, canopy, head, wg, fas, plate] + ports: 
    if o.parent is None: o.parent = root
for o in list(bpy.data.objects):
    if o.parent is None and o is not root and o.type in ('MESH', 'EMPTY') and not o.name.startswith('Wheel'):
        o.parent = root
# interior grouping
for n, items in (('InteriorSeatsColor1', seats1), ('InteriorSeatsColor2', seats2)):
    group(n, (0, 0, 0), items)
group('InteriorDash', (0, 0, 0), [dash, screen, tunnel, floor, col, yk] + amb)

for o in bpy.data.objects:
    if o.type == 'MESH' and not o.name.startswith(('Interior', 'Seat', 'Dash', 'Screen', 'Tunnel', 'Yoke', 'Cabin', 'Plate', 'RearFascia', 'Body', 'Canopy', 'Wing')):
        smooth(o, 40)
# ---------------------------------------------------------------- export
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', use_selection=False, export_apply=True,
                          export_yup=True, export_materials='EXPORT', export_normals=True, export_extras=False)
print('EXPORTED', OUT)
