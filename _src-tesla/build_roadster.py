# Blender (headless) build of the 2026 Tesla Roadster for the studio/tesla page. v5: faceted.
# Run: blender -b -P build_roadster.py -- out.glb
# Car space (matches three.js page): x = left (driver, LHD), y = up, z = forward. Units metres.
# Blender space: X = x, Y = -z, Z = y. glTF export (+Y up) maps it back.
# Profile traced from the Tesla Live stage side still (pure side view): length 4.27 m, wheelbase 2.78 m,
# roof 1.165 m, nose leading edge 0.50 m, tail deck 0.88 m. The body is built from straight-segment
# sections (flat facets, hard creases), a glasshouse with strong tumblehome and flying buttresses.
import bpy, bmesh, math, sys
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else '/tmp/roadster.glb'

WB = 2.78
ZF = WB / 2
def zd(d): return ZF - d
RF, RR_ = .345, .36           # front / rear tyre radius (staggered)
TRACK_F, TRACK_R = .845, .84
def V(x, y, z): return Vector((x, -z, y))

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
def set_mats(ob, names):
    ob.data.materials.clear()
    for n in names: ob.data.materials.append(MAT[n])

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

bpy.ops.wm.read_factory_settings(use_empty=True)
MAT.clear()
for n, c, me, r in [('Paint 1', '#e8e8e5', .1, .32), ('GlossBlack', '#060607', .2, .18), ('Carbon', '#111214', .3, .35),
                    ('Glass', '#0b0c0f', 0, .05), ('Underbody', '#050506', 0, .9), ('Chrome', '#d9dce0', 1, .15),
                    ('Tireside', '#0b0b0c', 0, .62), ('RimFace', '#1c1d20', .5, .32), ('Rim1', '#070708', .4, .2),
                    ('Insert', '#45484d', .7, .3), ('Bronze', '#7a5a3c', .9, .3), ('Disc', '#7d8085', 1, .45),
                    ('Caliper', '#1e2024', .6, .35), ('Interior 3', '#ecebe7', 0, .55), ('Interior Suede', '#2a2b2e', 0, .97),
                    ('Interior Black', '#0b0b0c', 0, .6), ('Dashboard', '#05070a', 0, .2),
                    ('Liner', '#08080a', 0, .85), ('Plate', '#f2f2f0', 0, .5), ('PlateText', '#0a0a0a', 0, .5),
                    ('Port', '#020203', 0, .6), ('Lens', '#0a0a0c', .1, .1)]:
    mat(n, srgb(c), me, r)
mat('Headlight', srgb('#e8eef8'), 0, .15, emit=srgb('#f2f6ff'), strength=9)
mat('Brakelight', srgb('#5a0a08'), 0, .2, emit=srgb('#ff1408'), strength=6)
mat('Signallight', srgb('#ff8a1a'), 0, .3, emit=srgb('#ff8a1a'), strength=4)
mat('Ambient', srgb('#ff2a22'), 0, .5, emit=srgb('#ff2a22'), strength=4)

root = bpy.data.objects.new('Roadster', None); bpy.context.collection.objects.link(root)

# ---------------------------------------------------------------- body sections (straight segments = flat facets)
# d | yc (centre top) | xh,yh (hood/deck edge) | xs,ys (shoulder crest = belt) | xw,yw (upper side crease, widest)
#   | xl,yl (lower side crease) | xb,yb (sill outer bottom) | ybot
BODY = table([
    [-0.80, 0.485, 0.440, 0.492, 0.700, 0.500, 0.780, 0.465, 0.790, 0.300, 0.750, 0.175, 0.165],
    [-0.74, 0.513, 0.480, 0.521, 0.800, 0.538, 0.870, 0.488, 0.875, 0.290, 0.840, 0.160, 0.150],
    [-0.60, 0.572, 0.500, 0.582, 0.855, 0.618, 0.930, 0.537, 0.930, 0.280, 0.885, 0.150, 0.140],
    [-0.40, 0.652, 0.520, 0.666, 0.872, 0.718, 0.963, 0.597, 0.963, 0.270, 0.918, 0.140, 0.130],
    [-0.15, 0.737, 0.540, 0.751, 0.878, 0.793, 0.983, 0.625, 0.980, 0.265, 0.934, 0.130, 0.125],
    [0.05, 0.787, 0.560, 0.803, 0.874, 0.828, 0.990, 0.630, 0.985, 0.260, 0.940, 0.130, 0.125],
    [0.22, 0.770, 0.620, 0.785, 0.862, 0.838, 0.985, 0.636, 0.980, 0.255, 0.935, 0.125, 0.120],
    [0.50, .73, .70, .74, .842, .79, .97, .61, .97, .25, .922, .12, .12],
    [0.80, .72, .70, .73, .832, .782, .962, .60, .962, .26, .914, .12, .12],
    [1.20, .76, .70, .77, .832, .825, .962, .61, .962, .285, .914, .12, .12],
    [1.60, .80, .70, .81, .836, .866, .966, .63, .966, .31, .918, .12, .12],
    [2.00, .87, .70, .88, .846, .935, .98, .66, .98, .36, .93, .125, .12],
    [2.40, .92, .70, .93, .86, .985, .995, .70, .995, .42, .945, .14, .13],
    [2.80, .87, .70, .88, .872, .935, 1.0, .72, 1.0, .47, .95, .18, .165],
    [3.15, .83, .70, .84, .874, .888, .99, .735, .99, .52, .944, .225, .205],
    [3.47, .81, .70, .82, .862, .872, .965, .745, .965, .55, .925, .27, .245],
])
D0, D1 = -.80, 3.47
BLK = pchip([-.80, -.5, 0, .5, 1.3, 2.0, 2.4, 3.2, 3.47], [.30, .28, .26, .245, .275, .335, .40, .50, .53])
SEG = [5, 4, 5, 8, 3, 6]   # samples per segment: hood, hood->crest, crest->upper, upper->lower, sill, bottom

def lin_chain(P, counts):
    out, band = [], []
    for i in range(len(P) - 1):
        (x0, y0), (x1, y1) = P[i], P[i + 1]
        for k in range(counts[i]):
            t = k / counts[i]; out.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)); band.append(i)
    return out, band

def body_section(d):
    yc, xh, yh, xs, ys, xw, yw, xl, yl, xb, yb, ybot = BODY(d)
    P = [(0, yc), (xh, yh), (xs, ys), (xw, yw), (xl, yl), (xb, yb), (0, ybot)]
    pts, band = lin_chain(P, SEG)
    pts.append((0, ybot)); band.append(5)
    band = [0 if b < 4 else (5 if b == 4 else 6) for b in band]
    yk = BLK(d); iw = 3 * 0 + max(range(len(pts) - 1), key=lambda i: pts[i][0])
    for i in range(len(pts) - 1):
        if pts[i][0] > .5 and pts[i][1] >= yk > pts[i + 1][1]:
            t = (pts[i][1] - yk) / (pts[i][1] - pts[i + 1][1])
            q = (pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, yk)
            pts.insert(i + 1, q); band.insert(i + 1, 5)
            for j in range(i + 1, len(band)):
                if band[j] < 5: band[j] = 5
            break
    return pts, band

def stations(d0, d1, step=.025, extra=()):
    n = max(2, int(round((d1 - d0) / step)))
    return sorted(set([round(d0 + (d1 - d0) * i / n, 5) for i in range(n + 1)] + [e for e in extra if d0 <= e <= d1]))

OPEN_BOTTOM = False
def loft_closed(name, ds, secfn, matfn, mats, cap0=1, cap1=1):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); rings = []
    for d in ds:
        pts, band = secfn(d)
        full = [(x, y, b) for (x, y), b in zip(pts, band)]
        right = [(-x, y, b) for (x, y), b in zip(pts[1:-1], band[1:-1])][::-1]
        rings.append([(bm.verts.new(V(x, y, zd(d))), b) for x, y, b in full + right])
    n = len(rings[0]); half = len(rings[0]) // 2 + 1
    for r in range(len(rings) - 1):
        A, B = rings[r], rings[r + 1]
        for i in range(n):
            j = (i + 1) % n
            bi = A[i][1] if i < half else A[j][1]
            try:
                f = bm.faces.new((A[i][0], A[j][0], B[j][0], B[i][0])); f.material_index = matfn(bi, ds[r])
            except ValueError: pass
    for mi, ring in ((cap0, rings[0]), (cap1, rings[-1])):
        if mi is None: continue
        vs = [v for v, _ in ring]
        try: f = bm.faces.new(vs); f.material_index = mi
        except ValueError: pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for n in mats: me.materials.append(MAT[n])
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
    return ob

# glasshouse: base sits on the shoulder crest; roof edge pulls in hard (tumblehome); behind the roof the
# edges become flying buttresses running to the tail while the centre panel (rear glass, then deck) drops.
# d | xr | yr (roof edge / buttress top) | yt (centre)
CAN = table([
    [0.20, .80, .856, .856],
    [0.32, .70, 0.896, 0.901],
    [0.60, .585, 1.002, 1.014],
    [1.00, .485, 1.112, 1.128],
    [1.35, .45, 1.148, 1.164],
    [1.70, .44, 1.150, 1.163],
    [1.95, .445, 1.128, 1.13],
    [2.20, .462, 1.117, 1.080],
    [2.50, .49, 1.072, 1.023],
    [2.85, .52, 1.007, 0.961],
    [3.15, .545, 0.936, 0.908],
    [3.45, .56, .878, .866],
])
C0, C1 = .20, 3.45
def canopy_section(d):
    xr, yr, yt = CAN(d); b = BODY(d); xs, ys = b[3] - .004, b[4] - .003
    return lin_chain([(0, yt), (xr, yr), (xs, ys)], [8, 7]) + ((xs, ys),)
def can_mat(band, d):
    # 0 Glass, 1 Paint 1, 2 GlossBlack
    if band == 0: return 0 if d < 2.92 else 1
    return 0 if d < 2.40 else 1
def loft_open(name, ds, secfn, matfn, mats, cap1=None):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); rings = []; bands = None
    for d in ds:
        pts, band, last = secfn(d)
        pts = pts + [last]; band = band + [band[-1]]
        ring = [(-x, y) for x, y in pts[::-1]] + pts[1:]
        bb = band[::-1] + band[1:]
        rings.append([bm.verts.new(V(x, y, zd(d))) for x, y in ring]); bands = bb
    for r in range(len(rings) - 1):
        A, B = rings[r], rings[r + 1]
        for i in range(len(A) - 1):
            b = bands[i] if i >= len(A) // 2 else bands[i + 1]
            try:
                f = bm.faces.new((A[i], A[i + 1], B[i + 1], B[i])); f.material_index = matfn(b, ds[r])
            except ValueError: pass
    if cap1 is not None:
        try: f = bm.faces.new(rings[-1]); f.material_index = cap1
        except ValueError: pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for n in mats: me.materials.append(MAT[n])
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
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


# ---------------------------------------------------------------- build
BAND_MATS = ['Paint 1', 'GlossBlack', 'Underbody']
def body_mat(b, d): return 0 if b < 5 else (1 if b == 5 else 2)
DS = stations(D0, D1, .02, extra=[-.74, -.6, -.4, -.15, .05, .22, .5, .8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.15])
body = loft_closed('Body', DS, body_section, body_mat, BAND_MATS, cap0=1, cap1=0)

cav = prism('cavCut', [(.08, .30), (.08, 1.4), (2.30, 1.4), (2.30, .30)], -.74, .74, mats=('Interior Black',))
boolean(body, cav); remove(cav)
WHEELS = [(0, RF, TRACK_F), (WB, RR_, TRACK_R)]
for dW, R, _ in WHEELS:
    for sg in (1, -1):
        c = cyl_x('arch', dW, R, R + .06, sg * .47, sg * 1.3, mats=('Liner',)); boolean(body, c); remove(c)
# side slot behind the front wheel, on the shoulder plane (dark lens) with an amber marker on its top edge
for sg in (1, -1):
    c = prism('slot', [(.30, .705), (.66, .745), (.66, .690), (.42, .672)], sg * .86, sg * 1.2, mats=('Lens',)); boolean(body, c); remove(c)

GAP = .0035
DOOR_POLY = [(.62, .12), (.52, .42), (.54, .72), (.62, .86), (.95, 1.20), (1.70, 1.20), (1.68, .95), (1.82, .55), (1.78, .12)]
HOOD_POLY = [(-.70, .3), (-.70, 1.2), (-.02, 1.2), (-.02, .3)]
DECK_POLY = [(2.95, .3), (2.95, 1.3), (3.42, 1.3), (3.42, .3)]
def up_and(xmax): return lambda c, n: abs(c.x) < xmax and n.z > .55
hood = separate(body, 'BodyHoodPanel', HOOD_POLY, up_and(.50), bis_x=(-.50, .50))
def x_gap(src, xs, poly, g=GAP):
    bm = bmesh.new(); bm.from_mesh(src.data)
    for x in xs: bisect_x(bm, x - g); bisect_x(bm, x + g)
    kill = [f for f in bm.faces if f.normal.z > .55 and pip(fdy(f)[0], poly) and any(abs(f.calc_center_median().x - x) < g for x in xs)]
    bmesh.ops.delete(bm, geom=kill, context='FACES'); bm.to_mesh(src.data); bm.free()
x_gap(body, (-.50, .50), offset_poly(HOOD_POLY, GAP))

canopy = loft_open('Canopy', stations(C0, C1, .02, extra=[.32, .6, 1.0, 1.35, 1.7, 1.95, 2.2, 2.4, 2.5, 2.85, 2.92, 3.15]),
                   canopy_section, can_mat, ['Glass', 'Paint 1', 'GlossBlack'], cap1=1)
doors = {}
for sg, nm in ((1, 'BodyDoorLColor1'), (-1, 'BodyDoorRColor1')):
    skin = separate(body, nm + 'Skin', DOOR_POLY, lambda c, n, sg=sg: c.x * sg > .5 and n.x * sg > -.2)
    glass = separate(canopy, nm + 'Glass', DOOR_POLY, lambda c, n, sg=sg: c.x * sg > .42 and n.x * sg > .2, gap=.006)
    doors[nm] = (skin, glass)
def separate_d(src, name, d0, d1, sel, gap=.006):
    return separate(src, name, [(d0, -1), (d0, 3), (d1, 3), (d1, -1)], sel, gap=gap)
wind = separate_d(canopy, 'BodyWindshield', .0, .98, lambda c, n: n.z > .25 or abs(c.x) < .5)
roofL = separate_d(canopy, 'BodyRoofPanelL', .98, 1.96, lambda c, n: n.z > .5 and c.x > .004)
roofR = separate_d(canopy, 'BodyRoofPanelR', .98, 1.96, lambda c, n: n.z > .5 and c.x < -.004)
deck = separate(canopy, 'BodyDeck', DECK_POLY, lambda c, n: abs(c.x) < .50 and n.z > .5)
canopy.name = 'BodyRearwindow'

def orient_out(ob, ref=None):
    me = ob.data; bm = bmesh.new(); bm.from_mesh(me)
    c = ref or V(0, .55, zd(1.25))
    for f in bm.faces:
        if (f.calc_center_median() - c).dot(f.normal) < 0: f.normal_flip()
    bm.to_mesh(me); bm.free()
def thicken(ob, t=.004):
    m = ob.modifiers.new('sol', 'SOLIDIFY'); m.thickness = t; m.offset = -1; m.use_rim = True
    apply_all(ob)
for o in [hood] + [doors[k][0] for k in doors]: thicken(o, .005)
bm = bmesh.new(); bm.from_mesh(body.data)
kill = [f for f in bm.faces if abs(abs(f.calc_center_median().x) - .74) < .01 and f.normal.x * f.calc_center_median().x < -.5 and pip(fdy(f)[0], DOOR_POLY)]
bmesh.ops.delete(bm, geom=kill, context='FACES'); bm.to_mesh(body.data); bm.free()
for o in [canopy, roofL, roofR, wind, deck] + [doors[k][1] for k in doors]:
    orient_out(o); thicken(o, .004)
# roof spine (black strip between the two removable glass panels)
spine = []
for d in [.98 + i * .049 for i in range(21)]:
    spine.append((0, CAN(d)[2] + .002, zd(d)))

# cabin tub
for nm, c, s, m in [('InteriorTubFloor', (0, .215, zd(1.2)), (1.46, .02, 2.2), 'Interior Suede'),
                    ('InteriorFirewall', (0, .45, zd(.10)), (1.46, .48, .02), 'Interior Black'),
                    ('InteriorBulkhead', (0, .55, zd(2.28)), (1.46, .66, .02), 'Interior Black')]:
    box(nm, c, s, (m,))
for sg in (1, -1):
    box('InteriorSill', (sg * .72, .48, zd(1.2)), (.03, .52, 2.2), ('Interior Black',))
    box('InteriorDoorCard', (sg * .78, .60, zd(1.15)), (.02, .30, .95), ('Interior 3',))
def liner(dW, R, sg):
    me = bpy.data.meshes.new('ArchLiner'); bm = bmesh.new(); seg = 40; Rl = R + .055; rows = []
    for k in range(seg + 1):
        a = math.radians(-25 + 230 * k / seg)
        zz, yy = zd(dW) + Rl * math.cos(a), R + Rl * math.sin(a)
        rows.append((bm.verts.new(V(sg * .47, yy, zz)), bm.verts.new(V(sg * .97, yy, zz))))
    for a, b in zip(rows, rows[1:]): bm.faces.new((a[0], a[1], b[1], b[0]))
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new('ArchLiner', me); bpy.context.collection.objects.link(ob); set_mats(ob, ['Liner']); return ob
for dW, R, _ in WHEELS:
    for sg in (1, -1):
        liner(dW, R, sg)
box('Underbody', (0, .128, zd(1.35)), (1.70, .01, 4.1), ('Underbody',))

# ---------------------------------------------------------------- lights & trim
def ribbon(name, pts, h, depth, matn):
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
def strip(name, A, B, matn):
    """quad strip between two point lists (car space)."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    ra = [bm.verts.new(V(*p)) for p in A]; rb = [bm.verts.new(V(*p)) for p in B]
    for i in range(len(A) - 1):
        try: bm.faces.new((ra[i], ra[i + 1], rb[i + 1], rb[i]))
        except ValueError: pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob); set_mats(ob, [matn]); return ob

ZN = zd(D0)
# full-width white light bar on the knife leading edge of the nose
b0 = BODY(D0)
lp = [(x, b0[0] - .004, ZN + .006) for x in [i / 40 * 2 * (b0[5] - .01) - (b0[5] - .01) for i in range(41)]]
head = ribbon('Headlights', lp, .02, .014, 'Headlight')
ribbon('HeadHousing', [(x, y - .002, z - .004) for x, y, z in lp], .03, .02, 'GlossBlack')
# angular headlight slashes: thin shards on the crest, pointed at the back, swept up the fender
def surf_y(x, d):
    pts, _ = body_section(d)
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        if x0 <= x <= x1 and x1 > x0:
            return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    return pts[0][1]
def tri_lamp(name, P0, P1, w0, matn, lift):
    """tapered blade lying on the body: wide (w0) at P0, point at P1; P = (x, d)."""
    A, B = [], []
    n = 16
    ux, ud = P1[0] - P0[0], P1[1] - P0[1]; L = math.hypot(ux, ud); nx, nd = -ud / L, ux / L
    for i in range(n + 1):
        t = i / n; w = w0 * (1 - t) ** .9
        cx, cd = P0[0] + ux * t, P0[1] + ud * t
        for side, lst in ((.5, A), (-.5, B)):
            x, d = cx + nx * w * side, cd + nd * w * side
            lst.append((x, surf_y(x, d) + lift, zd(d)))
    return strip(name, A, B, matn)
for sg in (1, -1):
    for nm, w, lift, mt in (('HeadHousing', .085, .008, 'GlossBlack'), ('HeadBlade', .04, .014, 'Headlight')):
        o = tri_lamp(nm, (.80, -.765), (.50, -.34), w, mt, lift)
        if sg < 0:
            o.scale.x = -1; bpy.context.view_layer.objects.active = o; o.select_set(True)
            bpy.ops.object.select_all(action='DESELECT'); o.select_set(True)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        bm = bmesh.new(); bm.from_mesh(o.data)
        for f in bm.faces:
            if f.normal.z < 0: f.normal_flip()
        bm.to_mesh(o.data); bm.free()
# amber marker on the slot's top edge
for sg in (1, -1):
    pts = []
    for i in range(9):
        d = .40 + .24 * i / 8; y = .705 + (.745 - .705) * (d - .30) / .36 + .006
        b = BODY(d); xs, ys, xw, yw = b[3], b[4], b[5], b[6]
        x = xs + (xw - xs) * (ys - y) / (ys - yw) + .004
        pts.append((sg * x, y, zd(d)))
    ribbon('SideMarker', pts, .008, .004, 'Signallight')
spl = [(x, .168, ZN + .03) for x in [i / 30 * 1.50 - .75 for i in range(31)]]
ribbon('Splitter', spl, .018, .26, 'Carbon')
prism('Chin', [(-.80, .46), (-.80, .15), (-.835, .155), (-.84, .20)], -.76, .76, mats=('GlossBlack',))

# ---------------------------------------------------------------- rear
TAILZ = zd(D1)
bt = BODY(D1)
ribbon('Taillight', [(x, .79, TAILZ + .006) for x in [i / 40 * 1.84 - .92 for i in range(41)]], .016, .016, 'Brakelight')
ribbon('TailLens', [(x, .79, TAILZ + .004) for x in [i / 40 * 1.86 - .93 for i in range(41)]], .036, .012, 'Lens')
box('RearValance', (0, .385, TAILZ + .004), (1.78, .27, .012), ('GlossBlack',))
# diffuser block with four recessed thruster ports
dif = box('RearDiffuser', (0, .35, TAILZ + .03), (1.30, .17, .09), ('GlossBlack',))
ports = []
for x in (-.41, -.137, .137, .41):
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=.046, depth=.2, location=V(x, .35, TAILZ), rotation=(math.pi / 2, 0, 0))
    c = bpy.context.active_object; set_mats(c, ['Port']); boolean(dif, c); remove(c)
    bpy.ops.mesh.primitive_torus_add(major_radius=.048, minor_radius=.006, major_segments=40, minor_segments=10, location=V(x, .35, TAILZ - .014), rotation=(math.pi / 2, 0, 0))
    t = bpy.context.active_object; t.name = 'ThrusterRing'; set_mats(t, ['Bronze']); ports.append(t)
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=.046, depth=.01, location=V(x, .35, TAILZ + .03), rotation=(math.pi / 2, 0, 0))
    b = bpy.context.active_object; b.name = 'ThrusterBore'; set_mats(b, ['Port']); ports.append(b)

plate = box('Plate', (0, .56, TAILZ - .006), (.34, .11, .006), ('Plate',))
bpy.ops.object.text_add(location=(0, 0, 0)); tx = bpy.context.active_object
tx.data.body = 'RDSTR'; tx.data.align_x = 'CENTER'; tx.data.align_y = 'CENTER'; tx.data.size = .075; tx.data.extrude = .002
tx.data.space_character = 1.15
bpy.ops.object.convert(target='MESH'); tx = bpy.context.active_object; tx.name = 'PlateText'
tx.rotation_euler = (math.pi / 2, 0, math.pi); tx.location = V(0, .555, TAILZ - .011)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True); set_mats(tx, ['PlateText'])

# wing: faceted blade forming the trailing edge of the deck, pointed tips past the body, endplate fins
def wing():
    me = bpy.data.meshes.new('BodyWing'); bm = bmesh.new(); rows = []
    N = 40
    for i in range(N + 1):
        x = -1.03 + 2.06 * i / N; ax = abs(x)
        tip = max(0, (ax - .86) / .17)
        dl = 3.08 + .16 * tip ** 1.3          # leading edge sweeps back to the point
        dt = 3.53 - .03 * tip
        yt = .888 + .012 * tip + .012 * max(0, 1 - ax / .45)
        th = .045 * (1 - .8 * tip)
        rows.append([bm.verts.new(V(x, yt - .012, zd(dl))), bm.verts.new(V(x, yt + .006, zd((dl + dt) / 2))), bm.verts.new(V(x, yt + .004, zd(dt))),
                     bm.verts.new(V(x, yt - th, zd(dt))), bm.verts.new(V(x, yt - th * .7, zd((dl + dt) / 2)))])
    for a, b in zip(rows, rows[1:]):
        for i in range(5):
            j = (i + 1) % 5; bm.faces.new((a[i], a[j], b[j], b[i]))
    bm.faces.new(rows[0]); bm.faces.new(rows[-1][::-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new('BodyWing', me); bpy.context.collection.objects.link(ob); set_mats(ob, ['Paint 1', 'GlossBlack'])
    for f in ob.data.polygons:
        if f.normal.z < -.3: f.material_index = 1   # underside black (blender Z = up)
    return ob
wg = wing()
for sg in (1, -1):
    prism('WingEndplate', [(3.18, .90), (3.53, .91), (3.53, .76), (3.40, .70), (3.18, .82)], sg * .955, sg * .975, mats=('GlossBlack',))

# ---------------------------------------------------------------- wheels: near-flush dark aero face, swept blades, light inserts
def revolve(name, prof, seg, matn):
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

def make_wheel(name, d, sg, tw, R):
    g = bpy.data.objects.new(name, None); bpy.context.collection.objects.link(g); g.parent = root
    cx = sg * (TRACK_F if d == 0 else TRACK_R)
    g.location = V(cx, R, zd(d))
    RR = R - .075; hw = tw / 2; o = sg
    prof = [(RR + .005, -o * hw * .86), (RR + .03, -o * hw * .98), (R - .03, -o * hw), (R - .006, -o * hw * .93), (R, -o * hw * .7),
            (R, o * hw * .7), (R - .006, o * hw * .93), (R - .03, o * hw), (RR + .03, o * hw * .98), (RR + .005, o * hw * .86)]
    if o < 0: prof = prof[::-1]
    ty = revolve(name + 'Tyre', prof, 96, 'Tireside'); ty.parent = g
    rim = bpy.data.objects.new(name + 'Rim', None); bpy.context.collection.objects.link(rim); rim.parent = g
    bp = [(RR + .006, o * hw * .9), (RR - .004, o * hw * .94), (RR - .014, o * hw * .88), (RR - .02, -o * hw * .8), (RR - .004, -o * hw * .86)]
    b = revolve(name + 'Barrel', bp, 96, 'Rim1'); b.parent = rim
    fx = o * hw * .90      # face almost flush with the sidewall
    dp = [(RR - .012, fx), (RR * .8, fx - o * .006), (RR * .45, fx - o * .012), (.06, fx - o * .014), (.0, fx - o * .014)]
    df = revolve(name + 'Face', dp, 96, 'RimFace'); df.parent = rim
    me = bpy.data.meshes.new(name + 'Spokes'); bm = bmesh.new(); tris = []
    for k in range(6):
        a0 = 2 * math.pi * k / 6
        def P(r, da, h):
            a = a0 + da + .35 * (r / RR) ** 1.5 * o   # swept blades
            return Vector((fx + o * h, r * math.cos(a), r * math.sin(a)))
        r0, r1 = .06, RR - .016
        v = [P(r0, -.32, .003), P(r0, 0, .012), P(r0, .32, .003), P(r1, -.05, .002), P(r1, 0, .006), P(r1, .05, .002)]
        Vv = [bm.verts.new(p) for p in v]
        for f in [(0, 1, 4, 3), (1, 2, 5, 4)]:
            bm.faces.new([Vv[i] for i in f])
        # light aero insert between this blade and the next (turbine slot)
        am = a0 + math.pi / 6
        ins = [P(RR * .52, math.pi / 6 - .10, .0015), P(RR - .03, math.pi / 6 - .13, .0015), P(RR - .03, math.pi / 6 + .13, .0015), P(RR * .52, math.pi / 6 + .10, .0015)]
        I = [bm.verts.new(p) for p in ins]; tris.append(bm.faces.new(I))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for f in bm.faces:
        if (f.normal.x * o) < 0: f.normal_flip()
    bm.to_mesh(me); bm.free()
    sp = bpy.data.objects.new(name + 'Spokes', me); bpy.context.collection.objects.link(sp); sp.parent = rim
    set_mats(sp, ['Rim1', 'Insert'])
    for f in sp.data.polygons:
        if f.index % 3 == 2: f.material_index = 1
    cp = [(.055, fx + o * .002), (.045, fx + o * .010), (.0, fx + o * .013)]
    cc = revolve(name + 'Cap', cp, 48, 'GlossBlack'); cc.parent = rim
    dsk = revolve(name + 'BrakeDisc', [(.12, -o * .04), (.205, -o * .04), (.205, -o * .01), (.12, -o * .01)], 64, 'Disc'); dsk.parent = g
    cal = box(name + 'BrakePad', (0, 0, 0), (.05, .07, .16), ('Caliper',)); cal.parent = g
    cal.location = Vector((-o * .02, .06 if d else -.06, .14))
    return g
wheels = [make_wheel('WheelFrontL', 0, 1, .265, RF), make_wheel('WheelFrontR', 0, -1, .265, RF),
          make_wheel('WheelRearL', WB, 1, .325, RR_), make_wheel('WheelRearR', WB, -1, .325, RR_)]

# ---------------------------------------------------------------- interior
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
dash = box('Dash', (0, .66, zd(.42)), (1.44, .18, .30), ('Interior Black',))
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
amb.append(ribbon('AmbientDash', [(x, .575, zd(.30)) for x in [-.7, 0, .7]], .006, .01, 'Ambient'))


spineob = ribbon('RoofSpine', spine, .006, .03, 'GlossBlack')

def group(name, pivot, kids):
    g = bpy.data.objects.new(name, None); bpy.context.collection.objects.link(g); g.parent = root; g.location = V(*pivot)
    bpy.context.view_layer.update()
    for k in kids:
        mw = k.matrix_world.copy(); k.parent = g; k.matrix_world = mw
    return g
for nm, (sk, gl) in doors.items():
    sg = 1 if nm.endswith('LColor1') else -1
    smooth(sk, 12); smooth(gl, 12)
    group(nm, (sg * .80, .86, zd(.60)), [sk, gl])
group('BodyHood', (0, .80, zd(-.02)), [hood]); smooth(hood, 12)
group('BodyRearPanelsColor1', (0, .93, zd(2.95)), [deck]); smooth(deck, 12)
group('BodyRoofPanel', (0, 1.16, zd(1.47)), [roofL, roofR, spineob]); smooth(roofL, 12); smooth(roofR, 12)
deck.name = 'BodyDeck'; hood.name = 'BodyHoodPanel'
for o in (body, canopy, wind): smooth(o, 12)
body.name = 'BodyPanelsColor1'
for o in list(bpy.data.objects):
    if o.parent is None and o is not root and o.type in ('MESH', 'EMPTY') and not o.name.startswith('Wheel'):
        o.parent = root
for n, items in (('InteriorSeatsColor1', seats1), ('InteriorSeatsColor2', seats2)):
    group(n, (0, 0, 0), items)
group('InteriorDash', (0, 0, 0), [dash, screen, tunnel, floor, col, yk] + amb)
for o in bpy.data.objects:
    if o.type == 'MESH' and not o.name.startswith(('Interior', 'Seat', 'Dash', 'Screen', 'Tunnel', 'Yoke', 'Cabin', 'Plate', 'Rear', 'Body', 'Canopy', 'Wing', 'Diffuser', 'Head', 'Roof')):
        smooth(o, 40)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', use_selection=False, export_apply=True,
                          export_yup=True, export_materials='EXPORT', export_normals=True, export_extras=False)
print('EXPORTED', OUT)
